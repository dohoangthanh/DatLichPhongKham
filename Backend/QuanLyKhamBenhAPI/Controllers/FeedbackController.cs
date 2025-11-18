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

        [HttpGet]
        public async Task<IActionResult> GetAllFeedback([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            // Only admin can view all feedback
            if (user.Role != "Admin") return Forbid();

            var totalCount = await _context.Feedbacks.CountAsync();
            var feedbacks = await _context.Feedbacks
                .Include(f => f.Patient)
                .Include(f => f.Doctor)
                    .ThenInclude(d => d.Specialty)
                .OrderByDescending(f => f.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(f => new
                {
                    f.FeedbackId,
                    f.Rating,
                    f.Comment,
                    f.CreatedDate,
                    f.ReplyText,
                    f.RepliedDate,
                    Patient = f.Patient != null ? new
                    {
                        PatientId = f.Patient.PatientId,
                        Name = f.Patient.Name,
                        Phone = f.Patient.Phone
                    } : null,
                    Doctor = f.Doctor != null ? new
                    {
                        f.Doctor.DoctorId,
                        f.Doctor.Name,
                        Specialty = f.Doctor.Specialty != null ? f.Doctor.Specialty.Name : null
                    } : null
                })
                .ToListAsync();

            return Ok(new
            {
                Data = feedbacks,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        [HttpPut("reply/{id}")]
        public async Task<IActionResult> ReplyToFeedback(int id, [FromBody] ReplyFeedbackDto dto)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            // Only admin can reply to feedback
            if (user.Role != "Admin") return Forbid();

            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null) return NotFound(new { Message = "Feedback not found" });

            feedback.ReplyText = dto.ReplyText;
            feedback.RepliedDate = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Reply submitted successfully", Feedback = feedback });
        }

        private async Task<UserAccount?> GetCurrentUser()
        {
            var usernameClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(usernameClaim))
                return null;

            return await _context.UserAccounts
                .FirstOrDefaultAsync(u => u.Username == usernameClaim);
        }
    }

    public class CreateFeedbackDto
    {
        public int? Rating { get; set; }
        public string? Comment { get; set; }
        public int? DoctorId { get; set; }
    }

    public class ReplyFeedbackDto
    {
        public string? ReplyText { get; set; }
    }
}