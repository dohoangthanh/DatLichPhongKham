using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;

namespace QuanLyKhamBenhAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly QuanLyKhamBenhContext _context;
        private readonly ILogger<AdminController> _logger;

        public AdminController(QuanLyKhamBenhContext context, ILogger<AdminController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách payments cho admin quản lý
        /// </summary>
        [HttpGet("payments")]
        public async Task<IActionResult> GetPayments([FromQuery] string? status = null)
        {
            try
            {
                var query = _context.Payments
                    .Include(p => p.Appointment)
                        .ThenInclude(a => a!.Patient)
                    .Include(p => p.Appointment)
                        .ThenInclude(a => a!.Doctor)
                    .AsQueryable();

                // Filter by status
                if (!string.IsNullOrEmpty(status))
                {
                    if (status.ToLower() == "pending")
                    {
                        query = query.Where(p => p.Status == "Pending");
                    }
                    else if (status.ToLower() == "paid")
                    {
                        query = query.Where(p => p.Status == "Paid");
                    }
                }

                var payments = await query
                    .OrderByDescending(p => p.PaymentDate)
                    .Select(p => new
                    {
                        PaymentId = p.PaymentId,
                        AppointmentId = p.AppointmentId,
                        TotalAmount = p.TotalAmount,
                        Status = p.Status,
                        PaymentMethod = p.PaymentMethod,
                        PaymentDate = p.PaymentDate,
                        TransactionId = p.TransactionId,
                        TransferContent = p.TransferContent,
                        PatientName = p.Appointment != null && p.Appointment.Patient != null
                            ? p.Appointment.Patient.Name
                            : "N/A",
                        DoctorName = p.Appointment != null && p.Appointment.Doctor != null
                            ? p.Appointment.Doctor.Name
                            : "N/A",
                        AppointmentDate = p.Appointment != null
                            ? p.Appointment.Date.ToString("dd/MM/yyyy")
                            : "N/A"
                    })
                    .ToListAsync();

                return Ok(payments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payments for admin");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Lấy chi tiết một payment
        /// </summary>
        [HttpGet("payments/{paymentId}")]
        public async Task<IActionResult> GetPaymentDetail(int paymentId)
        {
            try
            {
                var payment = await _context.Payments
                    .Include(p => p.Appointment)
                        .ThenInclude(a => a!.Patient)
                    .Include(p => p.Appointment)
                        .ThenInclude(a => a!.Doctor)
                            .ThenInclude(d => d!.Specialty)
                    .Include(p => p.Appointment)
                        .ThenInclude(a => a!.AppointmentServices!)
                            .ThenInclude(ads => ads.Service)
                    .FirstOrDefaultAsync(p => p.PaymentId == paymentId);

                if (payment == null)
                    return NotFound(new { Message = "Payment not found" });

                var result = new
                {
                    PaymentId = payment.PaymentId,
                    AppointmentId = payment.AppointmentId,
                    TotalAmount = payment.TotalAmount,
                    Status = payment.Status,
                    PaymentMethod = payment.PaymentMethod,
                    PaymentDate = payment.PaymentDate,
                    TransactionId = payment.TransactionId,
                    TransferContent = payment.TransferContent,
                    QrCodeUrl = payment.QrCodeUrl,
                    Patient = payment.Appointment?.Patient != null ? new
                    {
                        Name = payment.Appointment.Patient.Name,
                        Phone = payment.Appointment.Patient.Phone,
                        Address = payment.Appointment.Patient.Address
                    } : null,
                    Doctor = payment.Appointment?.Doctor != null ? new
                    {
                        Name = payment.Appointment.Doctor.Name,
                        Specialty = payment.Appointment.Doctor.Specialty?.Name
                    } : null,
                    Appointment = payment.Appointment != null ? new
                    {
                        Date = payment.Appointment.Date.ToString("dd/MM/yyyy"),
                        Time = payment.Appointment.Time.ToString(@"hh\:mm"),
                        Status = payment.Appointment.Status
                    } : null,
                    Services = payment.Appointment?.AppointmentServices?.Select(ads => new
                    {
                        ServiceName = ads.Service?.Name,
                        Price = ads.Service?.Price
                    }).ToList()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment detail");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }
    }
}
