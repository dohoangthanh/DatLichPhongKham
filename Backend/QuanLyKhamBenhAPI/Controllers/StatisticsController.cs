using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;

namespace QuanLyKhamBenhAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : ControllerBase
    {
        private readonly QuanLyKhamBenhContext _context;

        public StatisticsController(QuanLyKhamBenhContext context)
        {
            _context = context;
        }

        // GET: api/statistics/homepage
        [HttpGet("homepage")]
        public async Task<ActionResult<object>> GetHomepageStats()
        {
            try
            {
                // Đếm số bác sĩ
                var doctorCount = await _context.Doctors.CountAsync();

                // Đếm số chuyên khoa
                var specialtyCount = await _context.Specialties.CountAsync();

                // Tính tỷ lệ hài lòng từ feedback (rating >= 4 là hài lòng)
                var totalFeedbacks = await _context.Feedbacks.CountAsync();
                var satisfiedFeedbacks = await _context.Feedbacks
                    .Where(f => f.Rating >= 4)
                    .CountAsync();

                var satisfactionRate = totalFeedbacks > 0
                    ? Math.Round((double)satisfiedFeedbacks / totalFeedbacks * 100, 0)
                    : 98.0; // Giá trị mặc định nếu chưa có feedback

                return Ok(new
                {
                    doctorCount,
                    specialtyCount,
                    satisfactionRate = (int)satisfactionRate,
                    support24_7 = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi: {ex.Message}" });
            }
        }
    }
}
