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
        public async Task<ActionResult<IEnumerable<SpecialtyDto>>> GetSpecialties()
        {
            var specialties = await _context.Specialties.Select(s => new SpecialtyDto
            {
                SpecialtyId = s.SpecialtyId,
                Name = s.Name
            }).ToListAsync();

            return Ok(specialties);
        }

        [HttpPost]
        public async Task<ActionResult<SpecialtyDto>> PostSpecialty(CreateSpecialtyDto dto)
        {
            var specialty = new Specialty
            {
                Name = dto.Name
            };

            _context.Specialties.Add(specialty);
            await _context.SaveChangesAsync();

            var createdDto = new SpecialtyDto
            {
                SpecialtyId = specialty.SpecialtyId,
                Name = specialty.Name
            };

            return CreatedAtAction("GetSpecialty", new { id = specialty.SpecialtyId }, createdDto);
        }

        [HttpGet("{id}")]
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
                Name = specialty.Name
            };

            return Ok(dto);
        }
    }
}