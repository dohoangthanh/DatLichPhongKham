using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;
using QuanLyKhamBenhAPI.Services;
using System.Security.Claims;

namespace QuanLyKhamBenhAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocalChatController : ControllerBase
    {
        private readonly LocalChatbotService _chatService;
        private readonly QuanLyKhamBenhContext _context;
        private readonly ILogger<LocalChatController> _logger;

        public LocalChatController(
            LocalChatbotService chatService,
            QuanLyKhamBenhContext context,
            ILogger<LocalChatController> logger)
        {
            _chatService = chatService;
            _context = context;
            _logger = logger;
        }

        // POST /api/localchat/test - Test endpoint
        [HttpPost("test")]
        public IActionResult Test([FromBody] ChatRequest request)
        {
            return Ok(new { message = "Test successful: " + request?.Message });
        }

        // POST /api/localchat/chat
        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            try
            {
                _logger.LogInformation($"Received chat request: {request?.Message}");

                if (string.IsNullOrWhiteSpace(request?.Message))
                {
                    return BadRequest(new { message = "Vui lòng nhập câu hỏi." });
                }

                int? patientId = null;

                // Lấy patientId nếu user đã đăng nhập
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                if (!string.IsNullOrEmpty(username))
                {
                    var userAccount = await _context.UserAccounts
                        .FirstOrDefaultAsync(u => u.Username == username);
                    patientId = userAccount?.PatientId;
                }

                _logger.LogInformation("Calling chatService.GetResponseAsync");
                var response = await _chatService.GetResponseAsync(request.Message, patientId);
                _logger.LogInformation($"Got response: {response}");

                return Ok(new { message = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Chat endpoint");
                return StatusCode(500, new { message = $"Đã có lỗi xảy ra: {ex.Message}" });
            }
        }

        // GET /api/localchat/knowledge - Lấy danh sách kiến thức (Admin only)
        [HttpGet("knowledge")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetKnowledge()
        {
            var knowledge = await _context.ChatKnowledges
                .OrderByDescending(k => k.CreatedDate)
                .ToListAsync();

            return Ok(knowledge);
        }

        // POST /api/localchat/knowledge - Thêm kiến thức mới (Admin only)
        [HttpPost("knowledge")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddKnowledge([FromBody] AddKnowledgeRequest request)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;

                var knowledge = new ChatKnowledge
                {
                    Question = request.Question,
                    Answer = request.Answer,
                    Category = request.Category ?? "general",
                    CreatedBy = username,
                    CreatedDate = DateTime.Now,
                    IsActive = true
                };

                _context.ChatKnowledges.Add(knowledge);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Thêm kiến thức thành công", knowledge });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi thêm kiến thức" });
            }
        }

        // PUT /api/localchat/knowledge/{id} - Cập nhật kiến thức (Admin only)
        [HttpPut("knowledge/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateKnowledge(int id, [FromBody] AddKnowledgeRequest request)
        {
            try
            {
                var knowledge = await _context.ChatKnowledges.FindAsync(id);
                if (knowledge == null)
                    return NotFound(new { message = "Không tìm thấy kiến thức" });

                knowledge.Question = request.Question;
                knowledge.Answer = request.Answer;
                knowledge.Category = request.Category ?? knowledge.Category;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Cập nhật thành công", knowledge });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi cập nhật" });
            }
        }

        // DELETE /api/localchat/knowledge/{id} - Xóa kiến thức (Admin only)
        [HttpDelete("knowledge/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteKnowledge(int id)
        {
            try
            {
                var knowledge = await _context.ChatKnowledges.FindAsync(id);
                if (knowledge == null)
                    return NotFound(new { message = "Không tìm thấy kiến thức" });

                knowledge.IsActive = false;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Xóa thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi xóa" });
            }
        }
    }
}

public class AddKnowledgeRequest
{
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public string? Category { get; set; }
}
