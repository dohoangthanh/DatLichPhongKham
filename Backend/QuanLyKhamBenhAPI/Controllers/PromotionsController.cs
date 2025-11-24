using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;

namespace QuanLyKhamBenhAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PromotionsController : ControllerBase
    {
        private readonly QuanLyKhamBenhContext _context;

        public PromotionsController(QuanLyKhamBenhContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllPromotions()
        {
            var promotions = await _context.Promotions
                .OrderByDescending(p => p.StartDate)
                .ToListAsync();
            return Ok(promotions);
        }

        [HttpGet("active")]
        [AllowAnonymous]
        public async Task<IActionResult> GetActivePromotions()
        {
            var today = DateOnly.FromDateTime(DateTime.Now);
            var promotions = await _context.Promotions
                .Where(p => p.StartDate <= today && p.EndDate >= today)
                .ToListAsync();
            return Ok(promotions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPromotion(int id)
        {
            var promotion = await _context.Promotions.FindAsync(id);
            if (promotion == null) return NotFound();
            return Ok(promotion);
        }

        [HttpGet("validate/{promoCode}")]
        [AllowAnonymous]
        public async Task<IActionResult> ValidatePromoCode(string promoCode)
        {
            var today = DateOnly.FromDateTime(DateTime.Now);
            var promotion = await _context.Promotions
                .FirstOrDefaultAsync(p => 
                    p.Description!.Contains(promoCode) &&
                    p.StartDate <= today && 
                    p.EndDate >= today);

            if (promotion == null)
                return NotFound(new { Message = "Mã khuyến mãi không hợp lệ hoặc đã hết hạn" });

            return Ok(new
            {
                PromoId = promotion.PromoId,
                Description = promotion.Description,
                DiscountPercent = promotion.DiscountPercent,
                Message = "Mã khuyến mãi hợp lệ"
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreatePromotion([FromBody] CreatePromotionDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var promotion = new Promotion
            {
                Description = dto.Description,
                DiscountPercent = dto.DiscountPercent,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate
            };

            _context.Promotions.Add(promotion);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPromotion), new { id = promotion.PromoId }, promotion);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdatePromotion(int id, [FromBody] UpdatePromotionDto dto)
        {
            var promotion = await _context.Promotions.FindAsync(id);
            if (promotion == null) return NotFound();

            promotion.Description = dto.Description ?? promotion.Description;
            promotion.DiscountPercent = dto.DiscountPercent ?? promotion.DiscountPercent;
            promotion.StartDate = dto.StartDate ?? promotion.StartDate;
            promotion.EndDate = dto.EndDate ?? promotion.EndDate;

            await _context.SaveChangesAsync();
            return Ok(promotion);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePromotion(int id)
        {
            var promotion = await _context.Promotions.FindAsync(id);
            if (promotion == null) return NotFound();

            _context.Promotions.Remove(promotion);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class CreatePromotionDto
    {
        public string? Description { get; set; }
        public decimal? DiscountPercent { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }

    public class UpdatePromotionDto
    {
        public string? Description { get; set; }
        public decimal? DiscountPercent { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }
}
