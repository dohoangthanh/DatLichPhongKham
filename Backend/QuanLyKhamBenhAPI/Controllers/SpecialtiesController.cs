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
    public class SpecialtiesController : ControllerBase
    {
        private readonly QuanLyKhamBenhContext _context;

        public SpecialtiesController(QuanLyKhamBenhContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<SpecialtyDto>>> GetSpecialties()
        {
            var specialties = await _context.Specialties.Select(s => new SpecialtyDto
            {
                SpecialtyId = s.SpecialtyId,
                Name = s.Name,
                Description = s.Description
            }).ToListAsync();

            return Ok(specialties);
        }

        [HttpPost]
        public async Task<ActionResult<SpecialtyDto>> PostSpecialty(CreateSpecialtyDto dto)
        {
            var specialty = new Specialty
            {
                Name = dto.Name,
                Description = dto.Description
            };

            _context.Specialties.Add(specialty);
            await _context.SaveChangesAsync();

            var createdDto = new SpecialtyDto
            {
                SpecialtyId = specialty.SpecialtyId,
                Name = specialty.Name,
                Description = specialty.Description
            };

            return CreatedAtAction("GetSpecialty", new { id = specialty.SpecialtyId }, createdDto);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<SpecialtyDto>> GetSpecialty(int id)
        {
            var specialty = await _context.Specialties.FindAsync(id);
            if (specialty == null)
            {
                return NotFound();
            }

            var dto = new SpecialtyDto
            {
                SpecialtyId = specialty.SpecialtyId,
                Name = specialty.Name,
                Description = specialty.Description
            };

            return Ok(dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutSpecialty(int id, UpdateSpecialtyDto dto)
        {
            var specialty = await _context.Specialties.FindAsync(id);
            if (specialty == null)
            {
                return NotFound();
            }

            specialty.Name = dto.Name;
            specialty.Description = dto.Description;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SpecialtyExists(id))
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
        public async Task<IActionResult> DeleteSpecialty(int id)
        {
            var specialty = await _context.Specialties
                .Include(s => s.Doctors)
                .FirstOrDefaultAsync(s => s.SpecialtyId == id);
            
            if (specialty == null)
            {
                return NotFound();
            }

            // Check if specialty has doctors
            if (specialty.Doctors.Any())
            {
                return BadRequest("Không thể xóa chuyên khoa đang có bác sĩ");
            }

            _context.Specialties.Remove(specialty);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SpecialtyExists(int id)
        {
            return _context.Specialties.Any(e => e.SpecialtyId == id);
        }
    }
}