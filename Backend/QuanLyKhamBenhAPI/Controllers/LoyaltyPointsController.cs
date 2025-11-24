using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;

namespace QuanLyKhamBenhAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LoyaltyPointsController : ControllerBase
    {
        private readonly QuanLyKhamBenhContext _context;

        public LoyaltyPointsController(QuanLyKhamBenhContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllLoyaltyPoints()
        {
            var loyaltyPoints = await _context.LoyaltyPoints
                .Include(lp => lp.Patient)
                .OrderByDescending(lp => lp.Points)
                .ToListAsync();
            return Ok(loyaltyPoints);
        }

        [HttpGet("my-points")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMyPoints()
        {
            var user = await GetCurrentUser();
            if (user == null || user.PatientId == null) return Unauthorized();

            var loyaltyPoint = await _context.LoyaltyPoints
                .FirstOrDefaultAsync(lp => lp.PatientId == user.PatientId);

            if (loyaltyPoint == null)
            {
                loyaltyPoint = new LoyaltyPoint
                {
                    PatientId = user.PatientId,
                    Points = 0,
                    LastUpdated = DateTime.Now
                };
                _context.LoyaltyPoints.Add(loyaltyPoint);
                await _context.SaveChangesAsync();
            }

            return Ok(loyaltyPoint);
        }

        [HttpGet("patient/{patientId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPatientPoints(int patientId)
        {
            var loyaltyPoint = await _context.LoyaltyPoints
                .Include(lp => lp.Patient)
                .FirstOrDefaultAsync(lp => lp.PatientId == patientId);

            if (loyaltyPoint == null)
                return NotFound(new { Message = "Không tìm thấy thông tin điểm tích lũy" });

            return Ok(loyaltyPoint);
        }

        [HttpPost("add")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddPoints([FromBody] AddPointsDto dto)
        {
            var loyaltyPoint = await _context.LoyaltyPoints
                .FirstOrDefaultAsync(lp => lp.PatientId == dto.PatientId);

            if (loyaltyPoint == null)
            {
                loyaltyPoint = new LoyaltyPoint
                {
                    PatientId = dto.PatientId,
                    Points = dto.Points,
                    LastUpdated = DateTime.Now
                };
                _context.LoyaltyPoints.Add(loyaltyPoint);
            }
            else
            {
                loyaltyPoint.Points = (loyaltyPoint.Points ?? 0) + dto.Points;
                loyaltyPoint.LastUpdated = DateTime.Now;
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cập nhật điểm thành công", Points = loyaltyPoint.Points });
        }

        [HttpPost("redeem")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> RedeemPoints([FromBody] RedeemPointsDto dto)
        {
            var user = await GetCurrentUser();
            if (user == null || user.PatientId == null) return Unauthorized();

            var loyaltyPoint = await _context.LoyaltyPoints
                .FirstOrDefaultAsync(lp => lp.PatientId == user.PatientId);

            if (loyaltyPoint == null || (loyaltyPoint.Points ?? 0) < dto.Points)
                return BadRequest(new { Message = "Không đủ điểm để đổi" });

            loyaltyPoint.Points -= dto.Points;
            loyaltyPoint.LastUpdated = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Đổi điểm thành công", RemainingPoints = loyaltyPoint.Points });
        }

        [HttpPut("update/{patientId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdatePoints(int patientId, [FromBody] UpdatePointsDto dto)
        {
            var loyaltyPoint = await _context.LoyaltyPoints
                .FirstOrDefaultAsync(lp => lp.PatientId == patientId);

            if (loyaltyPoint == null)
                return NotFound(new { Message = "Không tìm thấy thông tin điểm tích lũy" });

            loyaltyPoint.Points = dto.Points;
            loyaltyPoint.LastUpdated = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(loyaltyPoint);
        }

        [HttpDelete("{pointsId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteLoyaltyPoints(int pointsId)
        {
            var loyaltyPoint = await _context.LoyaltyPoints.FindAsync(pointsId);
            if (loyaltyPoint == null) return NotFound();

            _context.LoyaltyPoints.Remove(loyaltyPoint);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private async Task<UserAccount?> GetCurrentUser()
        {
            var usernameClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(usernameClaim))
                return null;

            return await _context.UserAccounts.FirstOrDefaultAsync(u => u.Username == usernameClaim);
        }
    }

    public class AddPointsDto
    {
        public int PatientId { get; set; }
        public int Points { get; set; }
    }

    public class RedeemPointsDto
    {
        public int Points { get; set; }
    }

    public class UpdatePointsDto
    {
        public int Points { get; set; }
    }
}
