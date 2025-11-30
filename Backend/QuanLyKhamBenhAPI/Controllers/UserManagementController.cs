using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;
using QuanLyKhamBenhAPI.Models.DTOs;
using BCrypt.Net;

namespace QuanLyKhamBenhAPI.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Roles = "Admin")]
    public class UserManagementController : ControllerBase
    {
        private readonly QuanLyKhamBenhContext _context;

        public UserManagementController(QuanLyKhamBenhContext context)
        {
            _context = context;
        }

        // ==================== DOCTOR WITH ACCOUNT ====================

        /// <summary>
        /// Get all doctors with their user accounts
        /// </summary>
        [HttpGet("doctors")]
        public async Task<ActionResult<IEnumerable<DoctorWithAccountDto>>> GetDoctorsWithAccounts()
        {
            var doctors = await _context.Doctors
                .Include(d => d.Specialty)
                .Include(d => d.UserAccounts)
                .Select(d => new DoctorWithAccountDto
                {
                    DoctorId = d.DoctorId,
                    Name = d.Name,
                    Phone = d.Phone ?? "",
                    ImageUrl = d.ImageUrl,
                    Specialty = d.Specialty == null ? null : new SpecialtyDto
                    {
                        SpecialtyId = d.Specialty.SpecialtyId,
                        Name = d.Specialty.Name
                    },
                    UserAccount = d.UserAccounts.FirstOrDefault() == null ? null : new UserAccountDto
                    {
                        UserId = d.UserAccounts.First().UserId,
                        Username = d.UserAccounts.First().Username,
                        Role = d.UserAccounts.First().Role,
                        DoctorId = d.UserAccounts.First().DoctorId,
                        PatientId = d.UserAccounts.First().PatientId
                    }
                })
                .ToListAsync();

            return Ok(doctors);
        }

        /// <summary>
        /// Get a doctor by ID with account info
        /// </summary>
        [HttpGet("doctors/{id}")]
        public async Task<ActionResult<DoctorWithAccountDto>> GetDoctorWithAccount(int id)
        {
            var doctor = await _context.Doctors
                .Include(d => d.Specialty)
                .Include(d => d.UserAccounts)
                .FirstOrDefaultAsync(d => d.DoctorId == id);

            if (doctor == null)
                return NotFound();

            var dto = new DoctorWithAccountDto
            {
                DoctorId = doctor.DoctorId,
                Name = doctor.Name,
                Phone = doctor.Phone ?? "",
                ImageUrl = doctor.ImageUrl,
                Specialty = doctor.Specialty == null ? null : new SpecialtyDto
                {
                    SpecialtyId = doctor.Specialty.SpecialtyId,
                    Name = doctor.Specialty.Name
                },
                UserAccount = doctor.UserAccounts.FirstOrDefault() == null ? null : new UserAccountDto
                {
                    UserId = doctor.UserAccounts.First().UserId,
                    Username = doctor.UserAccounts.First().Username,
                    Role = doctor.UserAccounts.First().Role,
                    DoctorId = doctor.UserAccounts.First().DoctorId,
                    PatientId = doctor.UserAccounts.First().PatientId
                }
            };

            return Ok(dto);
        }

        /// <summary>
        /// Create a new doctor with user account
        /// </summary>
        [HttpPost("doctors")]
        public async Task<ActionResult<DoctorWithAccountDto>> CreateDoctorWithAccount(CreateDoctorWithAccountDto dto)
        {
            // Check if username already exists
            if (await _context.UserAccounts.AnyAsync(u => u.Username == dto.Username))
            {
                return BadRequest(new { message = "Username already exists" });
            }

            // Create doctor
            var doctor = new Doctor
            {
                Name = dto.Name,
                SpecialtyId = dto.SpecialtyId,
                Phone = dto.Phone,
                ImageUrl = dto.ImageUrl
            };

            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();

            // Create user account
            var userAccount = new UserAccount
            {
                Username = dto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "Doctor",
                DoctorId = doctor.DoctorId
            };

            _context.UserAccounts.Add(userAccount);
            await _context.SaveChangesAsync();

            // Fetch created doctor with account
            var createdDoctor = await _context.Doctors
                .Include(d => d.Specialty)
                .Include(d => d.UserAccounts)
                .FirstOrDefaultAsync(d => d.DoctorId == doctor.DoctorId);

            var result = new DoctorWithAccountDto
            {
                DoctorId = createdDoctor!.DoctorId,
                Name = createdDoctor.Name,
                Phone = createdDoctor.Phone ?? "",
                ImageUrl = createdDoctor.ImageUrl,
                Specialty = createdDoctor.Specialty == null ? null : new SpecialtyDto
                {
                    SpecialtyId = createdDoctor.Specialty.SpecialtyId,
                    Name = createdDoctor.Specialty.Name
                },
                UserAccount = new UserAccountDto
                {
                    UserId = userAccount.UserId,
                    Username = userAccount.Username,
                    Role = userAccount.Role,
                    DoctorId = userAccount.DoctorId,
                    PatientId = userAccount.PatientId
                }
            };

            return CreatedAtAction(nameof(GetDoctorWithAccount), new { id = doctor.DoctorId }, result);
        }

        /// <summary>
        /// Update doctor information
        /// </summary>
        [HttpPut("doctors/{id}")]
        public async Task<IActionResult> UpdateDoctor(int id, UpdateDoctorDto dto)
        {
            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null)
                return NotFound();

            // Update doctor info
            if (!string.IsNullOrEmpty(dto.Name)) doctor.Name = dto.Name;
            if (dto.SpecialtyId > 0) doctor.SpecialtyId = dto.SpecialtyId;
            if (!string.IsNullOrEmpty(dto.Phone)) doctor.Phone = dto.Phone;
            if (dto.ImageUrl != null) doctor.ImageUrl = dto.ImageUrl;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Delete a doctor and their user account
        /// </summary>
        [HttpDelete("doctors/{id}")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            var doctor = await _context.Doctors
                .Include(d => d.UserAccounts)
                .FirstOrDefaultAsync(d => d.DoctorId == id);

            if (doctor == null)
                return NotFound();

            // Delete associated user accounts
            _context.UserAccounts.RemoveRange(doctor.UserAccounts);

            // Delete doctor
            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ==================== PATIENT WITH ACCOUNT ====================

        /// <summary>
        /// Get all patients with their user accounts
        /// </summary>
        [HttpGet("patients")]
        public async Task<ActionResult<IEnumerable<PatientWithAccountDto>>> GetPatientsWithAccounts()
        {
            var patients = await _context.Patients
                .Include(p => p.UserAccounts)
                .Select(p => new PatientWithAccountDto
                {
                    PatientId = p.PatientId,
                    Name = p.Name,
                    Dob = p.Dob.HasValue ? p.Dob.Value.ToString("yyyy-MM-dd") : "Unknown",
                    Gender = p.Gender ?? "Unknown",
                    Phone = p.Phone ?? "Unknown",
                    Address = p.Address ?? "Unknown",
                    UserAccount = p.UserAccounts.FirstOrDefault() == null ? null : new UserAccountDto
                    {
                        UserId = p.UserAccounts.First().UserId,
                        Username = p.UserAccounts.First().Username,
                        Role = p.UserAccounts.First().Role,
                        DoctorId = p.UserAccounts.First().DoctorId,
                        PatientId = p.UserAccounts.First().PatientId
                    }
                })
                .ToListAsync();

            return Ok(patients);
        }

        /// <summary>
        /// Get a patient by ID with account info
        /// </summary>
        [HttpGet("patients/{id}")]
        public async Task<ActionResult<PatientWithAccountDto>> GetPatientWithAccount(int id)
        {
            var patient = await _context.Patients
                .Include(p => p.UserAccounts)
                .FirstOrDefaultAsync(p => p.PatientId == id);

            if (patient == null)
                return NotFound();

            var dto = new PatientWithAccountDto
            {
                PatientId = patient.PatientId,
                Name = patient.Name,
                Dob = patient.Dob?.ToString("yyyy-MM-dd") ?? "Unknown",
                Gender = patient.Gender ?? "Unknown",
                Phone = patient.Phone ?? "Unknown",
                Address = patient.Address ?? "Unknown",
                UserAccount = patient.UserAccounts.FirstOrDefault() == null ? null : new UserAccountDto
                {
                    UserId = patient.UserAccounts.First().UserId,
                    Username = patient.UserAccounts.First().Username,
                    Role = patient.UserAccounts.First().Role,
                    DoctorId = patient.UserAccounts.First().DoctorId,
                    PatientId = patient.UserAccounts.First().PatientId
                }
            };

            return Ok(dto);
        }

        /// <summary>
        /// Create a new patient with user account
        /// </summary>
        [HttpPost("patients")]
        public async Task<ActionResult<PatientWithAccountDto>> CreatePatientWithAccount(CreatePatientWithAccountDto dto)
        {
            // Check if username already exists
            if (await _context.UserAccounts.AnyAsync(u => u.Username == dto.Username))
            {
                return BadRequest(new { message = "Username already exists" });
            }

            // Validate and parse DOB
            if (!DateOnly.TryParse(dto.Dob, out var dob))
            {
                return BadRequest(new { message = "Invalid date of birth format. Use yyyy-MM-dd" });
            }

            // Create patient
            var patient = new Patient
            {
                Name = dto.Name,
                Dob = dob,
                Gender = dto.Gender,
                Phone = dto.Phone,
                Address = dto.Address
            };

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            // Create user account
            var userAccount = new UserAccount
            {
                Username = dto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "Patient",
                PatientId = patient.PatientId
            };

            _context.UserAccounts.Add(userAccount);
            await _context.SaveChangesAsync();

            // Return created patient with account
            var result = new PatientWithAccountDto
            {
                PatientId = patient.PatientId,
                Name = patient.Name,
                Dob = patient.Dob?.ToString("yyyy-MM-dd") ?? "Unknown",
                Gender = patient.Gender ?? "Unknown",
                Phone = patient.Phone ?? "Unknown",
                Address = patient.Address ?? "Unknown",
                UserAccount = new UserAccountDto
                {
                    UserId = userAccount.UserId,
                    Username = userAccount.Username,
                    Role = userAccount.Role,
                    DoctorId = userAccount.DoctorId,
                    PatientId = userAccount.PatientId
                }
            };

            return CreatedAtAction(nameof(GetPatientWithAccount), new { id = patient.PatientId }, result);
        }

        /// <summary>
        /// Update patient information
        /// </summary>
        [HttpPut("patients/{id}")]
        public async Task<IActionResult> UpdatePatient(int id, UpdatePatientDto dto)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null)
                return NotFound();

            // Update patient info
            if (!string.IsNullOrEmpty(dto.Name)) patient.Name = dto.Name;
            if (!string.IsNullOrEmpty(dto.Dob) && DateOnly.TryParse(dto.Dob, out var dob)) patient.Dob = dob;
            if (!string.IsNullOrEmpty(dto.Gender)) patient.Gender = dto.Gender;
            if (!string.IsNullOrEmpty(dto.Phone)) patient.Phone = dto.Phone;
            if (!string.IsNullOrEmpty(dto.Address)) patient.Address = dto.Address;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Delete a patient and their user account
        /// </summary>
        [HttpDelete("patients/{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var patient = await _context.Patients
                .Include(p => p.UserAccounts)
                .FirstOrDefaultAsync(p => p.PatientId == id);

            if (patient == null)
                return NotFound();

            // Delete associated user accounts
            _context.UserAccounts.RemoveRange(patient.UserAccounts);

            // Delete patient
            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ==================== USER ACCOUNT MANAGEMENT ====================

        /// <summary>
        /// Update user account credentials (username/password)
        /// </summary>
        [HttpPut("accounts/{userId}")]
        public async Task<IActionResult> UpdateUserAccount(int userId, UpdateUserAccountDto dto)
        {
            var account = await _context.UserAccounts.FindAsync(userId);
            if (account == null)
                return NotFound();

            // Update username if provided and not duplicate
            if (!string.IsNullOrEmpty(dto.Username))
            {
                if (await _context.UserAccounts.AnyAsync(u => u.Username == dto.Username && u.UserId != userId))
                {
                    return BadRequest(new { message = "Username already exists" });
                }
                account.Username = dto.Username;
            }

            // Update password if provided
            if (!string.IsNullOrEmpty(dto.Password))
            {
                account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            }

            // Update role if provided
            if (!string.IsNullOrEmpty(dto.Role))
            {
                account.Role = dto.Role;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Reset user password
        /// </summary>
        [HttpPost("accounts/{userId}/reset-password")]
        public async Task<IActionResult> ResetPassword(int userId, [FromBody] string newPassword)
        {
            var account = await _context.UserAccounts.FindAsync(userId);
            if (account == null)
                return NotFound();

            account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password reset successfully" });
        }
    }
}
