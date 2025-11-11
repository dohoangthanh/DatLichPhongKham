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
    [Authorize]
    public class ServicesController : ControllerBase
    {
        private readonly QuanLyKhamBenhContext _context;

        public ServicesController(QuanLyKhamBenhContext context)
        {
            _context = context;
        }

        // GET: api/services
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServiceDto>>> GetServices()
        {
            var services = await _context.Services.Select(s => new ServiceDto
            {
                ServiceId = s.ServiceId,
                Name = s.Name,
                Price = s.Price,
                Type = s.Type ?? "Unknown"
            }).ToListAsync();

            return Ok(services);
        }

        // POST: api/services
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ServiceDto>> PostService(CreateServiceDto dto)
        {
            var service = new Service
            {
                Name = dto.Name,
                Price = dto.Price,
                Type = dto.Type
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            var createdDto = new ServiceDto
            {
                ServiceId = service.ServiceId,
                Name = service.Name,
                Price = service.Price,
                Type = service.Type
            };

            return CreatedAtAction(nameof(GetServices), new { id = service.ServiceId }, createdDto);
        }
    }
}