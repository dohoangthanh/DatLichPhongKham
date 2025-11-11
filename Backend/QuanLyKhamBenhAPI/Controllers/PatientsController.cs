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
    public class PatientsController : ControllerBase
    {
        private readonly QuanLyKhamBenhContext _context;

        public PatientsController(QuanLyKhamBenhContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<ActionResult<IEnumerable<PatientDto>>> GetPatients()
        {
            var patients = await _context.Patients.Select(p => new PatientDto
            {
                PatientId = p.PatientId,
                Name = p.Name,
                Dob = p.Dob.HasValue ? p.Dob.Value.ToString("yyyy-MM-dd") : "Unknown",
                Gender = p.Gender ?? "Unknown",
                Phone = p.Phone ?? "Unknown",
                Address = p.Address ?? "Unknown"
            }).ToListAsync();

            return Ok(patients);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PatientDto>> GetPatient(int id)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            var patient = await _context.Patients.FindAsync(id);
            if (patient == null)
            {
                return NotFound();
            }

            // Patients can only access their own data
            if (user.Role == "Patient" && user.PatientId != id)
            {
                return Forbid();
            }
            // Doctors can access patients assigned to them (via appointments)
            if (user.Role == "Doctor")
            {
                var hasAccess = await _context.Appointments.AnyAsync(a => a.PatientId == id && a.DoctorId == user.DoctorId);
                if (!hasAccess)
                {
                    return Forbid();
                }
            }
            // Admin can access all

            var dto = new PatientDto
            {
                PatientId = patient.PatientId,
                Name = patient.Name,
                Dob = patient.Dob?.ToString("yyyy-MM-dd") ?? "Unknown",
                Gender = patient.Gender ?? "Unknown",
                Phone = patient.Phone ?? "Unknown",
                Address = patient.Address ?? "Unknown"
            };

            return Ok(dto);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PatientDto>> PostPatient(CreatePatientDto dto)
        {
            if (dto.Dob != null && !DateOnly.TryParse(dto.Dob, out var dob))
            {
                return BadRequest("Invalid date of birth format. Use yyyy-MM-dd");
            }

            var patient = new Patient
            {
                Name = dto.Name,
                Dob = dto.Dob != null ? DateOnly.Parse(dto.Dob) : null,
                Gender = dto.Gender,
                Phone = dto.Phone,
                Address = dto.Address
            };

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            var createdDto = new PatientDto
            {
                PatientId = patient.PatientId,
                Name = patient.Name,
                Dob = patient.Dob?.ToString("yyyy-MM-dd") ?? "Unknown",
                Gender = patient.Gender ?? "Unknown",
                Phone = patient.Phone ?? "Unknown",
                Address = patient.Address ?? "Unknown"
            };

            return CreatedAtAction("GetPatient", new { id = patient.PatientId }, createdDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPatient(int id, UpdatePatientDto dto)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            var existing = await _context.Patients.FindAsync(id);
            if (existing == null) return NotFound();

            // Patients can update their own data
            if (user.Role == "Patient" && user.PatientId != id)
            {
                return Forbid();
            }
            // Doctors can update patients assigned to them
            if (user.Role == "Doctor")
            {
                var hasAccess = await _context.Appointments.AnyAsync(a => a.PatientId == id && a.DoctorId == user.DoctorId);
                if (!hasAccess)
                {
                    return Forbid();
                }
            }
            // Admin can update all

            // Update fields
            if (!string.IsNullOrEmpty(dto.Name)) existing.Name = dto.Name;
            if (!string.IsNullOrEmpty(dto.Dob) && DateOnly.TryParse(dto.Dob, out var dob)) existing.Dob = dob;
            if (!string.IsNullOrEmpty(dto.Gender)) existing.Gender = dto.Gender;
            if (!string.IsNullOrEmpty(dto.Phone)) existing.Phone = dto.Phone;
            if (!string.IsNullOrEmpty(dto.Address)) existing.Address = dto.Address;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PatientExists(id))
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
        public async Task<IActionResult> DeletePatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null)
            {
                return NotFound();
            }

            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PatientExists(int id)
        {
            return _context.Patients.Any(e => e.PatientId == id);
        }

        private async Task<UserAccount?> GetCurrentUser()
        {
            var username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            if (username == null) return null;
            return await _context.UserAccounts.FirstOrDefaultAsync(u => u.Username == username);
        }
    }
}