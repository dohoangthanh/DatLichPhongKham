using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;
using System.Threading.Tasks;

namespace QuanLyKhamBenhAPI.Controllers
{
    [ApiController]
    [Route("api/patient")]
    [Authorize]
    public class PatientController : ControllerBase
    {
        private readonly QuanLyKhamBenhContext _context;

        public PatientController(QuanLyKhamBenhContext context)
        {
            _context = context;
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdatePatientProfileDto dto)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            // Only patients can update their own profile
            if (user.Role != "Patient") return Forbid();

            var patient = await _context.Patients.FindAsync(user.PatientId);
            if (patient == null)
                return NotFound(new { Message = "Không tìm thấy thông tin bệnh nhân" });

            // Update patient information
            patient.Name = dto.Name ?? patient.Name;
            patient.Dob = dto.Dob.HasValue ? DateOnly.FromDateTime(dto.Dob.Value) : patient.Dob;
            patient.Gender = dto.Gender ?? patient.Gender;
            patient.Phone = dto.Phone ?? patient.Phone;
            patient.Address = dto.Address ?? patient.Address;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Cập nhật thông tin thành công", Patient = new {
                patient.PatientId,
                patient.Name,
                patient.Dob,
                patient.Gender,
                patient.Phone,
                patient.Address
            }});
        }

        [HttpGet("my-records/{appointmentId}")]
        public async Task<IActionResult> GetMyMedicalRecords(int appointmentId)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            // Only patients can access their own records
            if (user.Role != "Patient") return Forbid();

            // Verify that this appointment belongs to the current patient
            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId && a.PatientId == user.PatientId);

            if (appointment == null)
                return NotFound(new { Message = "Không tìm thấy lịch hẹn hoặc bạn không có quyền truy cập" });

            // Get medical record with lab results
            var medicalRecord = await _context.MedicalRecords
                .Include(m => m.LabResults)
                .Include(m => m.Appointment)
                    .ThenInclude(a => a!.Doctor)
                        .ThenInclude(d => d!.Specialty)
                .FirstOrDefaultAsync(m => m.AppointmentId == appointmentId);

            if (medicalRecord == null)
                return NotFound(new { Message = "Chưa có kết quả khám bệnh" });

            var result = new
            {
                RecordId = medicalRecord.RecordId,
                Symptoms = medicalRecord.Symptoms,
                Diagnosis = medicalRecord.Diagnosis,
                Treatment = medicalRecord.Treatment,
                CreatedDate = medicalRecord.CreatedDate,
                Appointment = new
                {
                    AppointmentId = appointment.AppointmentId,
                    Date = appointment.Date,
                    Time = appointment.Time,
                    Doctor = appointment.Doctor != null ? new
                    {
                        DoctorId = appointment.Doctor!.DoctorId,
                        Name = appointment.Doctor!.Name,
                        Specialty = appointment.Doctor.Specialty?.Name
                    } : null
                },
                LabResults = medicalRecord.LabResults.Select(lr => new
                {
                    ResultId = lr.ResultId,
                    ResultDetails = lr.ResultDetails,
                    ResultDate = lr.ResultDate
                }).ToList()
            };

            return Ok(result);
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

    public class UpdatePatientProfileDto
    {
        public string? Name { get; set; }
        public DateTime? Dob { get; set; }
        public string? Gender { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
    }
}
