using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

            var payment = new Payment
            {
                TotalAmount = dto.TotalAmount,
                PaymentMethod = dto.PaymentMethod,
                Status = "Pending",
                PaymentDate = DateTime.Now,
                AppointmentId = dto.AppointmentId
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return Ok(new { PaymentId = payment.PaymentId, Message = "Payment created successfully" });
        }

        [HttpPut("confirm/{paymentId}")]
        public async Task<IActionResult> ConfirmPayment(int paymentId)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            var payment = await _context.Payments.FindAsync(paymentId);
            if (payment == null) return NotFound("Payment not found");

            // Check if payment belongs to user's appointment
            if (payment.Appointment != null)
            {
                if (user.Role == "Patient" && payment.Appointment.PatientId != user.PatientId) return Forbid();
            }

            payment.Status = "Paid";
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Payment confirmed successfully" });
        }

        private async Task<UserAccount?> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return null;

            return await _context.UserAccounts.FindAsync(userId);
        }
    }

    public class CreatePaymentDto
    {
        public int AppointmentId { get; set; }
        public decimal TotalAmount { get; set; }
        public string? PaymentMethod { get; set; }
    }
}