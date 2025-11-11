using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;
using QuanLyKhamBenhAPI.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QuanLyKhamBenhAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class DoctorsController : ControllerBase
    {
        private readonly QuanLyKhamBenhContext _context;

        public DoctorsController(QuanLyKhamBenhContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DoctorDto>>> GetDoctors(int? specialtyId = null)
        {
#pragma warning disable CS8601 // Possible null reference assignment - we check d.Specialty == null before accessing
            var query = _context.Doctors.Include(d => d.Specialty).AsQueryable();

            if (specialtyId.HasValue)
            {
                query = query.Where(d => d.SpecialtyId == specialtyId);
            }

            var doctors = await query.Select(d => new DoctorDto
            {
                DoctorId = d.DoctorId,
                Name = d.Name,
                Phone = d.Phone,
                Specialty = d.Specialty == null ? null : new SpecialtyDto
                {
                    SpecialtyId = d.Specialty!.SpecialtyId,
                    Name = d.Specialty!.Name
                }
            }).ToListAsync();

            return Ok(doctors);
#pragma warning restore CS8601
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DoctorDto>> GetDoctor(int id)
        {
#pragma warning disable CS8601 // Possible null reference assignment - we check doctor.Specialty == null before accessing
            var doctor = await _context.Doctors.Include(d => d.Specialty).FirstOrDefaultAsync(d => d.DoctorId == id);
            if (doctor == null)
            {
                return NotFound();
            }

            var dto = new DoctorDto
            {
                DoctorId = doctor.DoctorId,
                Name = doctor.Name,
                Phone = doctor.Phone,
                Specialty = doctor.Specialty == null ? null : new SpecialtyDto
                {
                    SpecialtyId = doctor.Specialty!.SpecialtyId,
                    Name = doctor.Specialty!.Name
                }
            };

            return Ok(dto);
#pragma warning restore CS8601
        }

        [HttpPost]
        public async Task<ActionResult<DoctorDto>> PostDoctor(CreateDoctorDto dto)
        {
            var doctor = new Doctor
            {
                Name = dto.Name,
                SpecialtyId = dto.SpecialtyId,
                Phone = dto.Phone
            };

            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();

            var createdDto = new DoctorDto
            {
                DoctorId = doctor.DoctorId,
                Name = doctor.Name,
                Phone = doctor.Phone,
                Specialty = await _context.Specialties
                    .Where(s => s.SpecialtyId == dto.SpecialtyId)
                    .Select(s => new SpecialtyDto
                    {
                        SpecialtyId = s.SpecialtyId,
                        Name = s.Name
                    }).FirstOrDefaultAsync()
            };

            return CreatedAtAction("GetDoctor", new { id = doctor.DoctorId }, createdDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutDoctor(int id, UpdateDoctorDto dto)
        {
            var existing = await _context.Doctors.FindAsync(id);
            if (existing == null) return NotFound();

            // Update fields
            if (!string.IsNullOrEmpty(dto.Name)) existing.Name = dto.Name;
            if (dto.SpecialtyId > 0) existing.SpecialtyId = dto.SpecialtyId;
            if (!string.IsNullOrEmpty(dto.Phone)) existing.Phone = dto.Phone;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DoctorExists(id))
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
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null)
            {
                return NotFound();
            }

            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DoctorExists(int id)
        {
            return _context.Doctors.Any(e => e.DoctorId == id);
        }
    }
}