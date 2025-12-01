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
    public class DoctorsController : ControllerBase
    {
        private readonly QuanLyKhamBenhContext _context;
        private readonly IWebHostEnvironment _environment;

        public DoctorsController(QuanLyKhamBenhContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // GET: api/doctors - Public endpoint for doctors listing page
        [HttpGet]
        [AllowAnonymous]
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
                ImageUrl = d.ImageUrl,
                Specialty = d.Specialty == null ? null : new SpecialtyDto
                {
                    SpecialtyId = d.Specialty!.SpecialtyId,
                    Name = d.Specialty!.Name
                }
            }).ToListAsync();

            return Ok(doctors);
#pragma warning restore CS8601
        }

        // GET: api/doctors/{id} - Public endpoint for doctor details
        [HttpGet("{id}")]
        [AllowAnonymous]
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
                ImageUrl = doctor.ImageUrl,
                Specialty = doctor.Specialty == null ? null : new SpecialtyDto
                {
                    SpecialtyId = doctor.Specialty!.SpecialtyId,
                    Name = doctor.Specialty!.Name
                }
            };

            return Ok(dto);
#pragma warning restore CS8601
        }

        // POST: api/doctors - Admin only
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<DoctorDto>> PostDoctor(CreateDoctorDto dto)
        {
            var doctor = new Doctor
            {
                Name = dto.Name,
                SpecialtyId = dto.SpecialtyId,
                Phone = dto.Phone,
                ImageUrl = dto.ImageUrl
            };

            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();

            var createdDto = new DoctorDto
            {
                DoctorId = doctor.DoctorId,
                Name = doctor.Name,
                Phone = doctor.Phone,
                ImageUrl = doctor.ImageUrl,
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

        // PUT: api/doctors/{id} - Admin only
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutDoctor(int id, UpdateDoctorDto dto)
        {
            var existing = await _context.Doctors.FindAsync(id);
            if (existing == null) return NotFound();

            // Update fields
            if (!string.IsNullOrEmpty(dto.Name)) existing.Name = dto.Name;
            if (dto.SpecialtyId > 0) existing.SpecialtyId = dto.SpecialtyId;
            if (!string.IsNullOrEmpty(dto.Phone)) existing.Phone = dto.Phone;
            if (dto.ImageUrl != null) existing.ImageUrl = dto.ImageUrl;

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

        // POST: api/doctors/upload-image - Admin/Doctor upload image
        [HttpPost("upload-image")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<string>> UploadImage([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded");
            }

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest("Invalid file type. Only jpg, jpeg, png, gif are allowed.");
            }

            // Validate file size (max 5MB)
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest("File size exceeds 5MB limit.");
            }

            try
            {
                // Create uploads directory if it doesn't exist
                var uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "doctors");
                Directory.CreateDirectory(uploadsFolder);

                // Generate unique filename
                var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Return relative URL
                var imageUrl = $"/uploads/doctors/{uniqueFileName}";
                return Ok(new { imageUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error uploading file: {ex.Message}");
            }
        }

        // DELETE: api/doctors/{id} - Admin only
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
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