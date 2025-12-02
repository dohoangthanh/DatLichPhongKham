using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Hubs;
using QuanLyKhamBenhAPI.Models;
using System.Security.Claims;

namespace QuanLyKhamBenhAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly QuanLyKhamBenhContext _context;
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly ILogger<ChatController> _logger;

        public ChatController(
            QuanLyKhamBenhContext context,
            IHubContext<ChatHub> hubContext,
            ILogger<ChatController> logger)
        {
            _context = context;
            _hubContext = hubContext;
            _logger = logger;
        }

        private async Task<UserAccount?> GetCurrentUser()
        {
            // Thử cả hai cách lấy userId
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("userId")?.Value;

            _logger.LogInformation($"🔍 Looking for user with claim: {userIdClaim}");

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                _logger.LogWarning($"⚠️ Cannot parse userId from claim: {userIdClaim}");
                return null;
            }

            _logger.LogInformation($"🔍 Searching for UserId: {userId} in database");

            var user = await _context.UserAccounts
                .Include(u => u.Patient)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                _logger.LogWarning($"⚠️ User not found in database for UserId: {userId}");
            }
            else
            {
                _logger.LogInformation($"✅ Found user: {user.Username}, Role: {user.Role}");
            }

            return user;
        }

        // GET: api/chat/test - Test authentication
        [HttpGet("test")]
        [AllowAnonymous]
        public ActionResult TestAuth()
        {
            return Ok(new
            {
                isAuthenticated = User.Identity?.IsAuthenticated ?? false,
                userName = User.Identity?.Name,
                claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList(),
                authHeader = Request.Headers["Authorization"].ToString()
            });
        }

        // GET: api/chat/messages - Lấy tin nhắn của patient với admin
        [HttpGet("messages")]
        public async Task<ActionResult> GetMessages()
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            int patientUserId;
            if (user.Role == "Patient")
            {
                patientUserId = user.UserId;
            }
            else
            {
                return BadRequest(new { message = "Chỉ bệnh nhân mới có thể xem tin nhắn của mình" });
            }

            var messages = await _context.ChatMessages
                .Where(m => m.PatientId == patientUserId)
                .OrderBy(m => m.SentAt)
                .Select(m => new
                {
                    m.MessageId,
                    m.Message,
                    m.SenderRole,
                    m.SentAt,
                    m.IsRead
                })
                .ToListAsync();

            return Ok(messages);
        }

        // POST: api/chat/send - Patient gửi tin nhắn
        [HttpPost("send")]
        public async Task<ActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            _logger.LogInformation($"📨 Received send message request");
            _logger.LogInformation($"🔐 Authorization Header: {Request.Headers["Authorization"]}");
            _logger.LogInformation($"👤 User.Identity.IsAuthenticated: {User.Identity?.IsAuthenticated}");
            _logger.LogInformation($"👤 User.Identity.Name: {User.Identity?.Name}");

            var user = await GetCurrentUser();
            if (user == null)
            {
                _logger.LogWarning("⚠️ User not found - Unauthorized");
                _logger.LogWarning($"⚠️ Claims count: {User.Claims.Count()}");
                foreach (var claim in User.Claims)
                {
                    _logger.LogWarning($"   Claim: {claim.Type} = {claim.Value}");
                }
                return Unauthorized(new { message = "Vui lòng đăng nhập" });
            }

            _logger.LogInformation($"👤 User: {user.Username}, Role: {user.Role}");

            if (user.Role != "Patient")
            {
                _logger.LogWarning($"⚠️ User {user.Username} is not a Patient (Role: {user.Role})");
                return BadRequest(new { message = "Chỉ bệnh nhân mới có thể gửi tin nhắn" });
            }

            var chatMessage = new ChatMessage
            {
                PatientId = user.UserId,
                Message = request.Message,
                SenderRole = "Patient",
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.ChatMessages.Add(chatMessage);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"✅ Message saved to DB with ID: {chatMessage.MessageId}");

            // Gửi realtime tới admin qua SignalR
            try
            {
                await _hubContext.Clients.Group("Admins").SendAsync("ReceiveMessageFromPatient", new
                {
                    patientId = user.UserId,
                    patientName = user.Username,
                    message = request.Message,
                    timestamp = chatMessage.SentAt,
                    messageId = chatMessage.MessageId
                });
                _logger.LogInformation($"📡 SignalR message sent to Admins group");
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ SignalR error: {ex.Message}");
            }

            return Ok(new
            {
                messageId = chatMessage.MessageId,
                message = "Tin nhắn đã được gửi",
                success = true
            });
        }

        // GET: api/chat/conversations - Admin xem danh sách cuộc hội thoại
        [HttpGet("conversations")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> GetConversations()
        {
            var conversations = await _context.ChatMessages
                .GroupBy(m => m.PatientId)
                .Select(g => new
                {
                    patientId = g.Key,
                    patientName = g.First().Patient!.Username,
                    lastMessage = g.OrderByDescending(m => m.SentAt).First().Message,
                    lastMessageTime = g.OrderByDescending(m => m.SentAt).First().SentAt,
                    unreadCount = g.Count(m => !m.IsRead && m.SenderRole == "Patient")
                })
                .OrderByDescending(c => c.lastMessageTime)
                .ToListAsync();

            return Ok(conversations);
        }

        // GET: api/chat/conversation/{patientId} - Admin xem chi tiết cuộc hội thoại
        [HttpGet("conversation/{patientId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> GetConversation(int patientId)
        {
            var messages = await _context.ChatMessages
                .Where(m => m.PatientId == patientId)
                .OrderBy(m => m.SentAt)
                .Select(m => new
                {
                    m.MessageId,
                    m.Message,
                    m.SenderRole,
                    m.SentAt,
                    m.IsRead,
                    adminName = m.Admin != null ? m.Admin.Username : null
                })
                .ToListAsync();

            // Đánh dấu đã đọc
            var unreadMessages = await _context.ChatMessages
                .Where(m => m.PatientId == patientId && !m.IsRead && m.SenderRole == "Patient")
                .ToListAsync();

            foreach (var msg in unreadMessages)
            {
                msg.IsRead = true;
            }

            if (unreadMessages.Any())
            {
                await _context.SaveChangesAsync();
            }

            return Ok(messages);
        }

        // POST: api/chat/reply/{patientId} - Admin trả lời
        [HttpPost("reply/{patientId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ReplyToPatient(int patientId, [FromBody] SendMessageRequest request)
        {
            var user = await GetCurrentUser();
            if (user == null) return Unauthorized();

            var patient = await _context.UserAccounts.FindAsync(patientId);
            if (patient == null || patient.Role != "Patient")
                return NotFound(new { message = "Không tìm thấy bệnh nhân" });

            var chatMessage = new ChatMessage
            {
                PatientId = patientId,
                AdminId = user.UserId,
                Message = request.Message,
                SenderRole = "Admin",
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.ChatMessages.Add(chatMessage);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"📤 Admin {user.Username} replying to patient {patientId}");

            // Gửi realtime tới patient qua SignalR
            try
            {
                await _hubContext.Clients.User(patientId.ToString()).SendAsync("ReceiveMessageFromAdmin", new
                {
                    adminName = user.Username,
                    message = request.Message,
                    timestamp = chatMessage.SentAt,
                    messageId = chatMessage.MessageId
                });
                _logger.LogInformation($"✅ SignalR message sent to patient {patientId}");
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"⚠️ Failed to send SignalR to patient {patientId}: {ex.Message}");
            }

            return Ok(new
            {
                messageId = chatMessage.MessageId,
                message = "Đã gửi tin nhắn"
            });
        }
    }

    public class SendMessageRequest
    {
        public string Message { get; set; } = string.Empty;
    }
}
