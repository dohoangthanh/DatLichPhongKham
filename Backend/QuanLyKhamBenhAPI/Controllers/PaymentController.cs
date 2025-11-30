using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;
using System.Threading.Tasks;

namespace QuanLyKhamBenhAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly QuanLyKhamBenhContext _context;

        public PaymentController(QuanLyKhamBenhContext context)
        {
            _context = context;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentDto dto)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            // Check if appointment exists and belongs to user
            var appointment = await _context.Appointments.FindAsync(dto.AppointmentId);
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

            return Ok(new 
            { 
                PaymentId = payment.PaymentId, 
                TotalAmount = totalAmount,
                OriginalAmount = dto.TotalAmount,
                DiscountApplied = appliedPromotion != null ? appliedPromotion.DiscountPercent : 0,
                Message = "Payment created successfully" 
            });
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

            // Check if payment belongs to user's appointment
            if (payment.Appointment != null)
            {
                if (user.Role == "Patient" && payment.Appointment.PatientId != user.PatientId) return Forbid();
            }

            // Update total amount if discount is provided
            if (dto != null && dto.FinalAmount.HasValue && dto.FinalAmount.Value > 0)
            {
                payment.TotalAmount = dto.FinalAmount.Value;
            }

            payment.Status = "Paid";

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
    }

    public class CreatePaymentDto
    {
        public int AppointmentId { get; set; }
        public decimal TotalAmount { get; set; }
        public string? PaymentMethod { get; set; }
        public string? PromoCode { get; set; }
    }
}