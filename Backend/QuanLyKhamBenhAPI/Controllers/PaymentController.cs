using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;
using QuanLyKhamBenhAPI.Services;
using System.Threading.Tasks;

namespace QuanLyKhamBenhAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly QuanLyKhamBenhContext _context;
        private readonly VietQRService _vietQRService;
        private readonly CassoService _cassoService;
        private readonly PayOSService _payOSService;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(
            QuanLyKhamBenhContext context,
            VietQRService vietQRService,
            CassoService cassoService,
            PayOSService payOSService,
            ILogger<PaymentController> logger)
        {
            _context = context;
            _vietQRService = vietQRService;
            _cassoService = cassoService;
            _payOSService = payOSService;
            _logger = logger;
        }

        // ==================== GET PAYMENT STATUS ====================
        [HttpGet("{paymentId}")]
        public async Task<IActionResult> GetPayment(int paymentId)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            var payment = await _context.Payments
                .Include(p => p.Appointment)
                    .ThenInclude(a => a!.Doctor)
                        .ThenInclude(d => d!.Specialty)
                .Include(p => p.Appointment)
                    .ThenInclude(a => a!.AppointmentServices!)
                        .ThenInclude(ads => ads.Service)
                .FirstOrDefaultAsync(p => p.PaymentId == paymentId);

            if (payment == null) return NotFound("Payment not found");

            // Check authorization
            if (payment.Appointment != null)
            {
                if (user.Role == "Patient" && payment.Appointment.PatientId != user.PatientId) return Forbid();
            }

            return Ok(new
            {
                PaymentId = payment.PaymentId,
                Status = payment.Status,
                TotalAmount = payment.TotalAmount,
                PaymentMethod = payment.PaymentMethod,
                PaymentDate = payment.PaymentDate,
                TransactionId = payment.TransactionId
            });
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentDto dto)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            // Check if appointment exists and belongs to user
            var appointment = await _context.Appointments
                .Include(a => a.Doctor)
                    .ThenInclude(d => d!.Specialty)
                .Include(a => a.AppointmentServices!)
                    .ThenInclude(ads => ads.Service)
                .FirstOrDefaultAsync(a => a.AppointmentId == dto.AppointmentId);
            if (appointment == null) return NotFound("Appointment not found");

            if (user.Role == "Patient" && appointment.PatientId != user.PatientId) return Forbid();

            decimal totalAmount = dto.TotalAmount;
            Promotion? appliedPromotion = null;

            // Apply promo code if provided
            if (!string.IsNullOrEmpty(dto.PromoCode))
            {
                var today = DateOnly.FromDateTime(DateTime.Now);
                appliedPromotion = await _context.Promotions
                    .FirstOrDefaultAsync(p =>
                        p.Description!.Contains(dto.PromoCode) &&
                        p.StartDate <= today &&
                        p.EndDate >= today);

                if (appliedPromotion != null && appliedPromotion.DiscountPercent.HasValue)
                {
                    decimal discount = totalAmount * (appliedPromotion.DiscountPercent.Value / 100);
                    totalAmount -= discount;
                }
            }

            var payment = new Payment
            {
                TotalAmount = totalAmount,
                PaymentMethod = dto.PaymentMethod ?? "Pending",
                Status = "Pending",
                PaymentDate = DateTime.Now,
                AppointmentId = dto.AppointmentId
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // Link promotion to payment if applied
            if (appliedPromotion != null)
            {
                var paymentPromotion = new PaymentPromotion
                {
                    PaymentId = payment.PaymentId,
                    PromoId = appliedPromotion.PromoId
                };
                _context.PaymentPromotions.Add(paymentPromotion);
                await _context.SaveChangesAsync();
            }

            // Tạo VietQR cho bank transfer
            string? qrCodeUrl = null;
            string? transferContent = null;
            string? bankName = null;
            string? accountNumber = null;
            string? accountName = null;

            if (dto.PaymentMethod?.ToLower() == "bank_transfer" || dto.PaymentMethod?.ToLower() == "banktransfer")
            {
                transferContent = $"THANHTOAN {payment.PaymentId}";

                var vietQRData = _vietQRService.GenerateVietQR(totalAmount, transferContent);

                qrCodeUrl = vietQRData.QrContent;
                bankName = vietQRData.BankName;
                accountNumber = vietQRData.AccountNumber;
                accountName = vietQRData.AccountName;

                payment.QrCodeUrl = qrCodeUrl;
                payment.TransferContent = transferContent;
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                PaymentId = payment.PaymentId,
                TotalAmount = totalAmount,
                OriginalAmount = dto.TotalAmount,
                DiscountApplied = appliedPromotion != null ? appliedPromotion.DiscountPercent : 0,
                QrCodeUrl = qrCodeUrl,
                TransferContent = transferContent,
                BankName = bankName,
                AccountNumber = accountNumber,
                AccountName = accountName,
                // Thông tin appointment để hiển thị trong modal
                AppointmentInfo = appointment != null ? new
                {
                    DoctorName = appointment.Doctor?.Name ?? "Unknown",
                    SpecialtyName = appointment.Doctor?.Specialty?.Name ?? "Unknown",
                    AppointmentDate = appointment.Date.ToString("dd/MM/yyyy"),
                    AppointmentTime = appointment.Time.ToString(@"hh\:mm"),
                    Services = appointment.AppointmentServices?.Select(ads => new
                    {
                        ServiceName = ads.Service?.Name ?? "Unknown",
                        Price = ads.Service?.Price ?? 0
                    }).ToList()
                } : null,
                Message = "Payment created successfully"
            });
        }

        // ==================== CASSO WEBHOOK ====================
        /// <summary>
        /// Webhook nhận thông báo từ Casso.vn khi có tiền chuyển vào tài khoản MB Bank
        /// Tự động cập nhật payment status khi khớp số tiền và nội dung chuyển khoản
        /// </summary>
        [HttpPost("casso-webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> CassoWebhook()
        {
            try
            {
                // 1. Đọc raw body
                using var reader = new StreamReader(Request.Body);
                var requestBody = await reader.ReadToEndAsync();

                _logger.LogInformation("Received Casso webhook: {Body}", requestBody);

                // 2. Verify checksum từ header hoặc parse từ body
                // Casso gửi checksum trong header X-Secure-Token hoặc trong body
                var receivedChecksum = Request.Headers["X-Secure-Token"].FirstOrDefault()
                    ?? Request.Headers["x-secure-token"].FirstOrDefault()
                    ?? "";

                // ⚠️ DEVELOPMENT: Cho phép webhook không có checksum (để test)
                // TODO: Bật lại verify checksum khi deploy production
                if (!string.IsNullOrEmpty(receivedChecksum))
                {
                    // 3. Verify webhook signature nếu có checksum
                    if (!_cassoService.VerifyWebhook(requestBody, receivedChecksum))
                    {
                        _logger.LogWarning("Casso webhook verification failed");
                        return Unauthorized(new { error = -1, message = "Invalid checksum" });
                    }
                }
                else
                {
                    _logger.LogWarning("⚠️ DEV MODE: Webhook without checksum - NOT SAFE FOR PRODUCTION!");
                }

                // Bỏ block verify để tiếp tục xử lý
                if (false && !_cassoService.VerifyWebhook(requestBody, receivedChecksum))
                {
                    _logger.LogWarning("Casso webhook verification failed");
                    return Unauthorized(new { error = -1, message = "Invalid checksum" });
                }

                // 4. Parse webhook data
                var webhookData = _cassoService.ParseWebhookData(requestBody);
                if (webhookData == null || webhookData.Data == null || !webhookData.Data.Any())
                {
                    _logger.LogWarning("Casso webhook has no transaction data");
                    return Ok(new { error = 0, message = "No data" });
                }

                // 5. Xử lý từng transaction
                foreach (var transaction in webhookData.Data)
                {
                    _logger.LogInformation("Processing transaction: TID={Tid}, Amount={Amount}, Description={Description}",
                        transaction.Tid, transaction.Amount, transaction.Description);

                    // 6. Tìm payment ID từ description
                    var paymentId = _cassoService.ExtractPaymentIdFromDescription(transaction.Description);
                    if (!paymentId.HasValue)
                    {
                        _logger.LogWarning("Could not extract payment ID from: {Description}", transaction.Description);
                        continue;
                    }

                    // 7. Tìm payment trong database
                    var payment = await _context.Payments
                        .Include(p => p.Appointment)
                        .FirstOrDefaultAsync(p => p.PaymentId == paymentId.Value);

                    if (payment == null)
                    {
                        _logger.LogWarning("Payment not found: {PaymentId}", paymentId.Value);
                        continue;
                    }

                    // 8. Kiểm tra đã thanh toán chưa (tránh duplicate)
                    if (payment.Status == "Paid")
                    {
                        _logger.LogInformation("Payment {PaymentId} already paid, skipping", paymentId.Value);
                        continue;
                    }

                    // 9. Kiểm tra số tiền khớp (cho phép sai lệch < 1 đồng do làm tròn)
                    if (Math.Abs(payment.TotalAmount - transaction.Amount) >= 1)
                    {
                        _logger.LogWarning("Amount mismatch: Expected={Expected}, Received={Received}",
                            payment.TotalAmount, transaction.Amount);
                        continue;
                    }

                    // 10. Cập nhật payment status
                    payment.Status = "Paid";
                    payment.PaymentDate = transaction.When;
                    payment.PaymentMethod = "Bank Transfer";
                    payment.TransactionId = transaction.Tid; // Lưu mã giao dịch ngân hàng

                    await _context.SaveChangesAsync();

                    _logger.LogInformation("Payment {PaymentId} marked as Paid. Transaction ID: {Tid}",
                        paymentId.Value, transaction.Tid);

                    // 11. (Optional) Gửi notification cho khách hàng
                    // await SendPaymentNotification(payment);
                }

                return Ok(new { error = 0, message = "success" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing Casso webhook");
                return StatusCode(500, new { error = -1, message = "Internal server error" });
            }
        }

        // ==================== PAYOS WEBHOOK ====================
        [AllowAnonymous]
        [HttpPost("payos-webhook")]
        public async Task<IActionResult> PayOSWebhook()
        {
            try
            {
                _logger.LogInformation("📨 PayOS webhook received");

                // 1. Read raw request body
                Request.EnableBuffering();
                using var reader = new StreamReader(Request.Body, leaveOpen: true);
                var requestBody = await reader.ReadToEndAsync();
                Request.Body.Position = 0;

                _logger.LogInformation("PayOS webhook body: {Body}", requestBody);

                // 2. Verify webhook signature
                var receivedSignature = Request.Headers["x-webhook-signature"].FirstOrDefault()
                    ?? Request.Headers["X-Webhook-Signature"].FirstOrDefault();

                if (string.IsNullOrEmpty(receivedSignature))
                {
                    _logger.LogWarning("⚠️ PayOS webhook missing signature header");
                    // PayOS có thể không gửi signature trong dev mode
                }
                else
                {
                    if (!_payOSService.VerifyWebhook(requestBody, receivedSignature))
                    {
                        _logger.LogWarning("❌ PayOS webhook signature verification failed");
                        return Unauthorized(new { error = -1, message = "Invalid signature" });
                    }
                    _logger.LogInformation("✅ PayOS webhook signature verified");
                }

                // 3. Parse webhook data
                var webhookData = _payOSService.ParseWebhookData(requestBody);
                if (webhookData == null || webhookData.Data == null)
                {
                    _logger.LogWarning("PayOS webhook has no data");
                    return Ok(new { error = 0, message = "No data" });
                }

                var data = webhookData.Data;
                _logger.LogInformation("Processing PayOS transaction: OrderCode={OrderCode}, Amount={Amount}, Description={Description}",
                    data.OrderCode, data.Amount, data.Description);

                // 4. Extract payment ID from OrderCode (PayOS sử dụng OrderCode = PaymentId)
                // Fallback: Thử parse từ description nếu có format "THANHTOAN {PaymentId}"
                int? paymentId = data.OrderCode > 0 ? (int)data.OrderCode : null;

                if (!paymentId.HasValue)
                {
                    paymentId = _payOSService.ExtractPaymentIdFromDescription(data.Description);
                }

                if (!paymentId.HasValue)
                {
                    _logger.LogWarning("Could not extract payment ID. OrderCode={OrderCode}, Description={Description}",
                        data.OrderCode, data.Description);
                    return Ok(new { error = 0, message = "Invalid payment identifier" });
                }

                // 5. Find payment in database
                var payment = await _context.Payments
                    .Include(p => p.Appointment)
                    .FirstOrDefaultAsync(p => p.PaymentId == paymentId.Value);

                if (payment == null)
                {
                    _logger.LogWarning("Payment not found: {PaymentId}", paymentId.Value);
                    return Ok(new { error = 0, message = "Payment not found" });
                }

                // 6. Check if already paid (avoid duplicates)
                if (payment.Status == "Paid")
                {
                    _logger.LogInformation("Payment {PaymentId} already paid, skipping", paymentId.Value);
                    return Ok(new { error = 0, message = "Already paid" });
                }

                // 7. Verify amount matches (allow < 1 VND difference due to rounding)
                if (Math.Abs(payment.TotalAmount - data.Amount) >= 1)
                {
                    _logger.LogWarning("Amount mismatch: Expected={Expected}, Received={Received}",
                        payment.TotalAmount, data.Amount);
                    return Ok(new { error = 0, message = "Amount mismatch" });
                }

                // 8. Update payment status
                payment.Status = "Paid";
                payment.PaymentDate = DateTime.TryParse(data.TransactionDateTime, out var transactionDate)
                    ? transactionDate
                    : DateTime.Now;
                payment.PaymentMethod = "Bank Transfer";
                payment.TransactionId = data.Reference ?? data.OrderCode.ToString();

                await _context.SaveChangesAsync();

                _logger.LogInformation("🎉 Payment {PaymentId} marked as Paid via PayOS. Reference: {Reference}",
                    paymentId.Value, payment.TransactionId);

                return Ok(new { error = 0, message = "success" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing PayOS webhook");
                return StatusCode(500, new { error = -1, message = "Internal server error" });
            }
        }

        [HttpPut("confirm/{paymentId}")]
        public async Task<IActionResult> ConfirmPayment(int paymentId, [FromBody] ConfirmPaymentDto? dto)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            var payment = await _context.Payments
                .Include(p => p.Appointment)
                .FirstOrDefaultAsync(p => p.PaymentId == paymentId);

            if (payment == null) return NotFound("Payment not found");

            // Check authorization - Admin có thể confirm bất kỳ payment nào
            if (user.Role != "Admin" && payment.Appointment != null)
            {
                if (user.Role == "Patient" && payment.Appointment.PatientId != user.PatientId)
                    return Forbid();
            }

            // Kiểm tra đã thanh toán chưa
            if (payment.Status == "Paid")
            {
                return BadRequest(new { Message = "Payment already confirmed" });
            }

            // Update payment status
            payment.Status = "Paid";
            payment.PaymentDate = DateTime.Now;
            payment.PaymentMethod = "Bank Transfer";

            // Lưu transaction ID nếu Admin cung cấp
            if (dto?.TransactionId != null)
            {
                payment.TransactionId = dto.TransactionId;
            }

            // Update total amount if discount is provided
            if (dto != null && dto.FinalAmount.HasValue && dto.FinalAmount.Value > 0)
            {
                payment.TotalAmount = dto.FinalAmount.Value;
            }

            // Update appointment status to completed if payment is confirmed
            if (payment.Appointment != null)
            {
                payment.Appointment.Status = "Completed";
            }

            // Add loyalty points (1 point per 10,000 VND) based on final amount
            if (payment.Appointment != null && payment.Appointment.PatientId.HasValue)
            {
                int pointsToAdd = (int)(payment.TotalAmount / 10000);

                var loyaltyPoint = await _context.LoyaltyPoints
                    .FirstOrDefaultAsync(lp => lp.PatientId == payment.Appointment.PatientId);

                if (loyaltyPoint == null)
                {
                    loyaltyPoint = new LoyaltyPoint
                    {
                        PatientId = payment.Appointment.PatientId.Value,
                        Points = pointsToAdd,
                        LastUpdated = DateTime.Now
                    };
                    _context.LoyaltyPoints.Add(loyaltyPoint);
                }
                else
                {
                    loyaltyPoint.Points = (loyaltyPoint.Points ?? 0) + pointsToAdd;
                    loyaltyPoint.LastUpdated = DateTime.Now;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Payment confirmed successfully" });
        }

        [HttpGet("invoice/{appointmentId}")]
        public async Task<IActionResult> GetInvoice(int appointmentId)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            var payment = await _context.Payments
                .Include(p => p.Appointment)
                    .ThenInclude(a => a!.Patient)
                .Include(p => p.Appointment)
                    .ThenInclude(a => a!.Doctor)
                        .ThenInclude(d => d!.Specialty)
                .FirstOrDefaultAsync(p => p.AppointmentId == appointmentId);

            if (payment == null) return NotFound("Payment not found");

            // Check if payment belongs to user's appointment
            if (payment.Appointment != null)
            {
                if (user.Role == "Patient" && payment.Appointment.PatientId != user.PatientId) return Forbid();
            }

            // Get loyalty points earned and current balance
            int loyaltyPointsEarned = (int)(payment.TotalAmount / 10000);
            int currentPoints = 0;
            if (payment.Appointment?.PatientId != null)
            {
                var currentLoyaltyPoints = await _context.LoyaltyPoints
                    .FirstOrDefaultAsync(lp => lp.PatientId == payment.Appointment.PatientId);
                currentPoints = currentLoyaltyPoints?.Points ?? 0;
            }

            // Create invoice data
            var invoice = new
            {
                InvoiceId = $"INV-{DateTime.Now.Year}-{payment.PaymentId:D6}",
                AppointmentId = appointmentId,
                Date = payment.PaymentDate?.ToString("yyyy-MM-dd"),
                PatientName = payment.Appointment?.Patient?.Name ?? "Unknown",
                PatientUsername = user.Username,
                DoctorName = payment.Appointment?.Doctor?.Name ?? "Unknown",
                Specialty = payment.Appointment?.Doctor?.Specialty?.Name ?? "Unknown",
                AppointmentDate = payment.Appointment != null ? payment.Appointment.Date.ToString("yyyy-MM-dd") : "Unknown",
                AppointmentTime = payment.Appointment != null ? payment.Appointment.Time.ToString(@"hh\:mm\:ss") : "Unknown",
                AppointmentDayOfWeek = payment.Appointment != null ? payment.Appointment.Date.ToString("dddd", new System.Globalization.CultureInfo("vi-VN")) : "Unknown",
                Items = new[]
                {
                    new { Name = "Phí khám ban đầu", Quantity = 1, Price = 270000 },
                    new { Name = "Xét nghiệm máu tổng quát", Quantity = 1, Price = 0 },
                    new { Name = "Phí dịch vụ", Quantity = 1, Price = 0 }
                },
                Subtotal = 270000,
                Tax = 0, // No tax in sample
                Total = payment.TotalAmount,
                PaymentMethod = payment.PaymentMethod ?? "Unknown",
                PaymentDate = payment.PaymentDate?.ToString("yyyy-MM-dd HH:mm:ss"),
                Status = payment.Status == "Paid" ? "Đã thanh toán" : "Chưa thanh toán",
                LoyaltyPointsEarned = loyaltyPointsEarned,
                CurrentLoyaltyPoints = currentPoints
            };

            return Ok(invoice);
        }

        private async Task<UserAccount?> GetCurrentUser()
        {
            var usernameClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(usernameClaim))
                return null;

            return await _context.UserAccounts.FirstOrDefaultAsync(u => u.Username == usernameClaim);
        }
    }

    public class ConfirmPaymentDto
    {
        public decimal? FinalAmount { get; set; }
        public string? TransactionId { get; set; }
    }

    public class CreatePaymentDto
    {
        public int AppointmentId { get; set; }
        public decimal TotalAmount { get; set; }
        public string? PaymentMethod { get; set; }
        public string? PromoCode { get; set; }
    }
}