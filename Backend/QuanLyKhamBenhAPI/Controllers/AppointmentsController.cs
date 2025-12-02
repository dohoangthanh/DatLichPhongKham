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
                    Phone = a.Doctor.Phone,
                    ImageUrl = a.Doctor.ImageUrl,
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
                    Phone = appointment.Doctor.Phone,
                    ImageUrl = appointment.Doctor.ImageUrl,
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

            // Check if appointment time has passed or too close (within 2 hours for Patient)
            var appointmentDateTime = appointment.Date.ToDateTime(appointment.Time);
            var hoursUntilAppointment = (appointmentDateTime - DateTime.Now).TotalHours;

            // Admin/Doctor can cancel anytime, but Patient must cancel at least 2 hours before
            if (user.Role == "Patient" && hoursUntilAppointment < 2)
            {
                if (hoursUntilAppointment < 0)
                {
                    return BadRequest(new { message = "Không thể hủy lịch đã qua giờ hẹn. Vui lòng liên hệ hotline: 1900-565656" });
                }
                else
                {
                    return BadRequest(new { message = $"Không thể hủy lịch trong vòng 2 giờ trước giờ khám (còn {hoursUntilAppointment:F1} giờ). Vui lòng liên hệ hotline: 1900-565656 để được hỗ trợ." });
                }
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

        [HttpPut("{id}/reschedule")]
        [Authorize(Roles = "Patient,Admin")]
        public async Task<IActionResult> RescheduleAppointment(int id, [FromBody] RescheduleAppointmentDto dto)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            var appointment = await _context.Appointments
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);

            if (appointment == null) return NotFound(new { message = "Không tìm thấy lịch hẹn" });

            // Check permissions - Patient can only reschedule their own appointments
            if (user.Role == "Patient" && appointment.PatientId != user.PatientId)
            {
                return Forbid();
            }

            // Can only reschedule "Scheduled" appointments
            if (appointment.Status != "Scheduled")
            {
                return BadRequest(new { message = $"Không thể đổi lịch hẹn có trạng thái '{appointment.Status}'. Chỉ có thể đổi lịch hẹn đang 'Scheduled'." });
            }

            // Check if appointment time has passed or too close (within 2 hours)
            var appointmentDateTime = appointment.Date.ToDateTime(appointment.Time);
            var hoursUntilAppointment = (appointmentDateTime - DateTime.Now).TotalHours;

            // Admin can reschedule anytime, but Patient must reschedule at least 2 hours before
            if (user.Role == "Patient" && hoursUntilAppointment < 2)
            {
                if (hoursUntilAppointment < 0)
                {
                    return BadRequest(new { message = "Không thể đổi lịch đã qua giờ hẹn. Vui lòng liên hệ hotline: 1900-565656" });
                }
                else
                {
                    return BadRequest(new { message = $"Không thể đổi lịch trong vòng 2 giờ trước giờ khám (còn {hoursUntilAppointment:F1} giờ). Vui lòng liên hệ hotline: 1900-565656 để được hỗ trợ." });
                }
            }

            // Parse new date and time
            if (!DateOnly.TryParse(dto.Date, out var newDate))
            {
                return BadRequest(new { message = "Ngày không hợp lệ. Định dạng: yyyy-MM-dd" });
            }
            if (!TimeOnly.TryParse(dto.Time, out var newTime))
            {
                return BadRequest(new { message = "Giờ không hợp lệ. Định dạng: HH:mm" });
            }

            // Check if new doctor exists
            var newDoctor = await _context.Doctors.FindAsync(dto.DoctorId);
            if (newDoctor == null)
            {
                return BadRequest(new { message = "Bác sĩ không tồn tại" });
            }

            // Check if the new slot is available (no existing appointment at same time)
            var conflictingAppointment = await _context.Appointments
                .AnyAsync(a => a.DoctorId == dto.DoctorId
                    && a.Date == newDate
                    && a.Time == newTime
                    && a.AppointmentId != id
                    && a.Status != "Cancelled");

            if (conflictingAppointment)
            {
                return BadRequest(new { message = "Khung giờ này đã có người đặt. Vui lòng chọn giờ khác." });
            }

            // Save history before changing
            var history = new AppointmentHistory
            {
                AppointmentId = appointment.AppointmentId,
                OldDate = appointment.Date,
                OldTime = appointment.Time,
                OldDoctorId = appointment.DoctorId,
                NewDate = newDate,
                NewTime = newTime,
                NewDoctorId = dto.DoctorId,
                ChangedBy = user.Role,
                ChangeReason = dto.Reason ?? "Bệnh nhân yêu cầu đổi lịch",
                ChangedDate = DateTime.Now
            };

            _context.AppointmentHistories.Add(history);

            // Update appointment
            appointment.Date = newDate;
            appointment.Time = newTime;
            appointment.DoctorId = dto.DoctorId;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đổi lịch thành công",
                newDate = newDate.ToString("yyyy-MM-dd"),
                newTime = newTime.ToString(@"hh\:mm"),
                newDoctor = newDoctor.Name
            });
        }

        [HttpGet("{id}/history")]
        [Authorize(Roles = "Patient,Doctor,Admin")]
        public async Task<ActionResult<IEnumerable<AppointmentHistoryDto>>> GetAppointmentHistory(int id)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return NotFound(new { message = "Không tìm thấy lịch hẹn" });

            // Check permissions
            if (user.Role == "Patient" && appointment.PatientId != user.PatientId)
            {
                return Forbid();
            }
            if (user.Role == "Doctor" && appointment.DoctorId != user.DoctorId)
            {
                return Forbid();
            }

            var histories = await _context.AppointmentHistories
                .Include(h => h.OldDoctor)
                .Include(h => h.NewDoctor)
                .Where(h => h.AppointmentId == id)
                .OrderByDescending(h => h.ChangedDate)
                .Select(h => new AppointmentHistoryDto
                {
                    HistoryId = h.HistoryId,
                    OldDate = h.OldDate.ToString("yyyy-MM-dd"),
                    OldTime = h.OldTime.ToString(@"hh\:mm"),
                    OldDoctorName = h.OldDoctor != null ? h.OldDoctor.Name : null,
                    NewDate = h.NewDate.ToString("yyyy-MM-dd"),
                    NewTime = h.NewTime.ToString(@"hh\:mm"),
                    NewDoctorName = h.NewDoctor != null ? h.NewDoctor.Name : null,
                    ChangedBy = h.ChangedBy,
                    ChangeReason = h.ChangeReason,
                    ChangedDate = h.ChangedDate
                })
                .ToListAsync();

            return Ok(histories);
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