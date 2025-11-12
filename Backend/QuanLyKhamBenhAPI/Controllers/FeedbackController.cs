using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyKhamBenhAPI.Models;
using System.Threading.Tasks;

namespace QuanLyKhamBenhAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FeedbackController : ControllerBase
    {
        private readonly QuanLyKhamBenhContext _context;

        public FeedbackController(QuanLyKhamBenhContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateFeedback([FromBody] CreateFeedbackDto dto)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            // Only patients can give feedback
            if (user.Role != "Patient") return Forbid();

            var feedback = new Feedback
            {
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedDate = DateTime.Now,
                PatientId = user.PatientId,
                DoctorId = dto.DoctorId
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            return Ok(new { FeedbackId = feedback.FeedbackId, Message = "Feedback submitted successfully" });
        }

        private async Task<UserAccount?> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return null;

            return await _context.UserAccounts.FindAsync(userId);
        }
    }

    public class CreateFeedbackDto
    {
        public int? Rating { get; set; }
        public string? Comment { get; set; }
        public int? DoctorId { get; set; }
    }
}