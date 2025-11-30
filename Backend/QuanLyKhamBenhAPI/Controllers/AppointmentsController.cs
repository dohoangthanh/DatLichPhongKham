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
    [Route("api/[controller]")]
    [Authorize]
    public class AppointmentsController : ControllerBase
    {
        private readonly QuanLyKhamBenhContext _context;

        public AppointmentsController(QuanLyKhamBenhContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppointmentSummaryDto>>> GetAppointments()
        {
#pragma warning disable CS8602 // Dereference of a possibly null reference - user is checked for null above
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            UserAccount currentUser = user;

            var query = _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d.Specialty)
                .AsQueryable();

            if (currentUser.Role == "Patient")
            {
                query = query.Where(a => a.PatientId == currentUser.PatientId);
            }
            else if (currentUser.Role == "Doctor")
            {
                query = query.Where(a => a.DoctorId == currentUser.DoctorId);
            }
            // Admin sees all

            var appointments = await query.Select(a => new AppointmentSummaryDto
            {
                AppointmentId = a.AppointmentId,
                Date = a.Date.ToString("yyyy-MM-dd"),
                Time = a.Time.ToString(@"hh\:mm"),
                Status = a.Status,
                Doctor = a.Doctor != null ? new DoctorSummaryDto
                {
                    DoctorId = a.Doctor.DoctorId,
                    Name = a.Doctor.Name,
                    SpecialtyName = a.Doctor.Specialty != null ? a.Doctor.Specialty.Name : "Unknown"
                } : null
            }).ToListAsync();

            return Ok(appointments);
#pragma warning restore CS8602
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AppointmentSummaryDto>> GetAppointment(int id)
        {
#pragma warning disable CS8602 // Dereference of a possibly null reference - user is checked for null above
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            UserAccount currentUser = user;

            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d.Specialty)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);
            if (appointment == null)
            {
                return NotFound();
            }

            // Check access
            if (currentUser.Role == "Patient" && appointment.PatientId != currentUser.PatientId)
            {
                return Forbid();
            }
            if (currentUser.Role == "Doctor" && appointment.DoctorId != currentUser.DoctorId)
            {
                return Forbid();
            }
            // Admin can access all

            var dto = new AppointmentSummaryDto
            {
                AppointmentId = appointment.AppointmentId,
                Date = appointment.Date.ToString("yyyy-MM-dd"),
                Time = appointment.Time.ToString(@"hh\:mm"),
                Status = appointment.Status,
                Doctor = appointment.Doctor != null ? new DoctorSummaryDto
                {
                    DoctorId = appointment.Doctor.DoctorId,
                    Name = appointment.Doctor.Name,
                    SpecialtyName = appointment.Doctor.Specialty?.Name ?? "Unknown"
                } : null,
                Patient = appointment.Patient != null ? new PatientSummaryDto
                {
                    PatientId = appointment.Patient.PatientId,
                    Name = appointment.Patient.Name,
                    Phone = appointment.Patient.Phone,
                    Dob = appointment.Patient.Dob?.ToString("yyyy-MM-dd"),
                    Gender = appointment.Patient.Gender,
                    Address = appointment.Patient.Address
                } : null
            };

            return Ok(dto);
#pragma warning restore CS8602
        }

        [HttpPost]
        [Authorize(Roles = "Patient,Doctor,Admin")]
        public async Task<ActionResult<AppointmentSummaryDto>> PostAppointment(CreateAppointmentDto dto)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            // Patients can only book for themselves
            if (user.Role == "Patient" && dto.PatientId != user.PatientId)
            {
                return Forbid();
            }
            // Doctors and Admins can book for any patient

            if (!DateOnly.TryParse(dto.Date, out var date))
            {
                return BadRequest("Invalid date format. Use yyyy-MM-dd");
            }
            if (!TimeOnly.TryParse(dto.Time, out var time))
            {
                return BadRequest("Invalid time format. Use HH:mm");
            }

            var appointment = new Appointment
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                Date = date,
                Time = time,
                Status = "Scheduled"
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            // Return the created DTO
            var createdDto = new AppointmentSummaryDto
            {
                AppointmentId = appointment.AppointmentId,
                Date = appointment.Date.ToString("yyyy-MM-dd"),
                Time = appointment.Time.ToString(@"hh\:mm"),
                Status = appointment.Status,
                Doctor = await _context.Doctors
                    .Where(d => d.DoctorId == dto.DoctorId)
                    .Select(d => new DoctorSummaryDto
                    {
                        DoctorId = d.DoctorId,
                        Name = d.Name,
                        SpecialtyName = d.Specialty!.Name
                    }).FirstOrDefaultAsync()
            };

            return CreatedAtAction("GetAppointment", new { id = appointment.AppointmentId }, createdDto);
        }

        [HttpPut("{id}/cancel")]
        [Authorize(Roles = "Patient,Doctor,Admin")]
        public async Task<IActionResult> CancelAppointment(int id)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return NotFound();

            // Check if appointment is already cancelled
            if (appointment.Status == "Cancelled")
            {
                return BadRequest(new { message = "Appointment is already cancelled" });
            }

            // Check permissions
            if (user.Role == "Patient" && appointment.PatientId != user.PatientId)
            {
                return Forbid();
            }
            if (user.Role == "Doctor" && appointment.DoctorId != user.DoctorId)
            {
                return Forbid();
            }

            // Cancel the appointment - this frees up the time slot
            appointment.Status = "Cancelled";

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Appointment cancelled successfully. Time slot is now available for booking." });
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AppointmentExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> PutAppointment(int id, UpdateAppointmentDto dto)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            // Check if user can modify this appointment
            var existing = await _context.Appointments.FindAsync(id);
            if (existing == null) return NotFound();

            // Lock Cancelled and Completed status - cannot be modified
            if (existing.Status == "Cancelled")
            {
                return BadRequest(new { message = "Cannot modify a cancelled appointment. Cancelled status is locked." });
            }
            if (existing.Status == "Completed")
            {
                return BadRequest(new { message = "Cannot modify a completed appointment. Completed status is locked." });
            }

            if (user.Role == "Doctor" && existing.DoctorId != user.DoctorId)
            {
                return Forbid();
            }
            // Admin can modify all (except Cancelled and Completed)

            // Update only allowed fields
            if (!string.IsNullOrEmpty(dto.Status))
            {
                // Prevent direct status change to Cancelled through PUT
                // Must use /cancel endpoint instead
                if (dto.Status == "Cancelled")
                {
                    return BadRequest(new { message = "Use /cancel endpoint to cancel appointments" });
                }
                existing.Status = dto.Status;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AppointmentExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound();
            }

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AppointmentExists(int id)
        {
            return _context.Appointments.Any(e => e.AppointmentId == id);
        }

        private async Task<UserAccount?> GetCurrentUser()
        {
            var username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            if (username == null) return null;
            return await _context.UserAccounts.FirstOrDefaultAsync(u => u.Username == username);
        }
    }
}