using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;
using QuanLyKhamBenhAPI.Models.DTOs;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuanLyKhamBenhAPI.Controllers
{
    [ApiController]
    [Route("api/schedule")]
    [Authorize]
    public class ScheduleController : ControllerBase
    {
        private readonly QuanLyKhamBenhContext _context;

        public ScheduleController(QuanLyKhamBenhContext context)
        {
            _context = context;
        }

        // POST: api/schedule/workshift
        [HttpPost("workshift")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<WorkShiftDto>> PostWorkShift(CreateWorkShiftDto dto)
        {
            if (!DateOnly.TryParse(dto.Date, out var shiftDate))
            {
                return BadRequest("Invalid shift date format. Use yyyy-MM-dd");
            }

            var workShift = new WorkShift
            {
                DoctorId = dto.DoctorId,
                Date = shiftDate,
                StartTime = TimeOnly.Parse(dto.StartTime),
                EndTime = TimeOnly.Parse(dto.EndTime)
            };

            _context.WorkShifts.Add(workShift);
            await _context.SaveChangesAsync();

            var createdDto = new WorkShiftDto
            {
                ShiftId = workShift.ShiftId,
                DoctorId = workShift.DoctorId.Value,
                Date = workShift.Date.ToString("yyyy-MM-dd"),
                StartTime = workShift.StartTime.ToString(@"hh\:mm"),
                EndTime = workShift.EndTime.ToString(@"hh\:mm")
            };

            return CreatedAtAction(nameof(GetWorkShifts), new { doctorId = workShift.DoctorId }, createdDto);
        }

        // GET: api/schedule/workshift/{doctorId}
        [HttpGet("workshift/{doctorId}")]
        public async Task<ActionResult<IEnumerable<WorkShiftDto>>> GetWorkShifts(int doctorId)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            // Doctors can only view their own schedule
            if (user.Role == "Doctor" && user.DoctorId != doctorId)
            {
                return Forbid();
            }
            // Admin can view all

            var workShifts = await _context.WorkShifts
                .Where(w => w.DoctorId == doctorId)
                .Select(w => new WorkShiftDto
                {
                    ShiftId = w.ShiftId,
                    DoctorId = w.DoctorId!.Value,
                    Date = w.Date.ToString("yyyy-MM-dd"),
                    StartTime = w.StartTime.ToString(@"hh\:mm"),
                    EndTime = w.EndTime.ToString(@"hh\:mm")
                })
                .ToListAsync();

            return Ok(workShifts);
        }

        private async Task<UserAccount?> GetCurrentUser()
        {
            var username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            if (username == null) return null;
            return await _context.UserAccounts.FirstOrDefaultAsync(u => u.Username == username);
        }
    }
}