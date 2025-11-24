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
        public async Task<IActionResult> ConfirmPayment(int paymentId)
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

            payment.Status = "Paid";

            // Add loyalty points (1 point per 10,000 VND)
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

        private async Task<UserAccount?> GetCurrentUser()
        {
            var usernameClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(usernameClaim))
                return null;

            return await _context.UserAccounts.FirstOrDefaultAsync(u => u.Username == usernameClaim);
        }
    }

    public class CreatePaymentDto
    {
        public int AppointmentId { get; set; }
        public decimal TotalAmount { get; set; }
        public string? PaymentMethod { get; set; }
        public string? PromoCode { get; set; }
    }
}