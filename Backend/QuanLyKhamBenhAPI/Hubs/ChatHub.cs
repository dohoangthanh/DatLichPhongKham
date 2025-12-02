using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace QuanLyKhamBenhAPI.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ILogger<ChatHub> _logger;
        private static readonly Dictionary<string, string> _userConnections = new();

        public ChatHub(ILogger<ChatHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? Context.User?.FindFirst("userId")?.Value;
            var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value
                       ?? Context.User?.FindFirst("role")?.Value;

            if (userId != null)
            {
                _userConnections[userId] = Context.ConnectionId;
                _logger.LogInformation($"✅ User {userId} ({role}) connected with ConnectionId: {Context.ConnectionId}");

                // Nếu là admin, join vào admin group
                if (role == "Admin")
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
                    _logger.LogInformation($"✅ Admin {userId} added to Admins group");
                }
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? Context.User?.FindFirst("userId")?.Value;
            var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value
                       ?? Context.User?.FindFirst("role")?.Value;

            if (userId != null)
            {
                _userConnections.Remove(userId);
                _logger.LogInformation($"❌ User {userId} disconnected");

                if (role == "Admin")
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Admins");
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        // Patient gửi tin nhắn đến Admin
        public async Task SendMessageToAdmin(string message)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? Context.User?.FindFirst("userId")?.Value;
            var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value
                           ?? Context.User?.Identity?.Name;

            if (userId != null)
            {
                _logger.LogInformation($"📨 Patient {userName} (ID: {userId}) sending message to admin: {message}");

                // Gửi tin nhắn đến tất cả admin đang online
                await Clients.Group("Admins").SendAsync("ReceiveMessageFromPatient", new
                {
                    patientId = int.Parse(userId),
                    patientName = userName,
                    message = message,
                    timestamp = DateTime.UtcNow
                });

                _logger.LogInformation($"✅ Message sent to Admins group");
            }
        }

        // Admin gửi tin nhắn đến Patient
        public async Task SendMessageToPatient(string patientId, string message)
        {
            var adminId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? Context.User?.FindFirst("userId")?.Value;
            var adminName = Context.User?.FindFirst(ClaimTypes.Name)?.Value
                            ?? Context.User?.Identity?.Name;
            var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value
                       ?? Context.User?.FindFirst("role")?.Value;

            if (role != "Admin")
            {
                _logger.LogWarning($"⚠️ Unauthorized attempt to send message as admin by user {adminId}");
                return;
            }

            _logger.LogInformation($"📨 Admin {adminName} sending message to patient {patientId}: {message}");

            // Gửi đến patient cụ thể nếu họ đang online
            if (_userConnections.TryGetValue(patientId, out var connectionId))
            {
                await Clients.Client(connectionId).SendAsync("ReceiveMessageFromAdmin", new
                {
                    adminName = adminName,
                    message = message,
                    timestamp = DateTime.UtcNow
                });
                _logger.LogInformation($"✅ Message sent to patient {patientId}");
            }
            else
            {
                _logger.LogInformation($"⚠️ Patient {patientId} is offline");
            }
        }

        // Thông báo typing indicator
        public async Task PatientTyping(bool isTyping)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? Context.User?.FindFirst("userId")?.Value;
            var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value
                           ?? Context.User?.Identity?.Name;

            await Clients.Group("Admins").SendAsync("PatientTypingStatus", new
            {
                patientId = userId,
                patientName = userName,
                isTyping = isTyping
            });
        }

        public async Task AdminTyping(string patientId, bool isTyping)
        {
            if (_userConnections.TryGetValue(patientId, out var connectionId))
            {
                await Clients.Client(connectionId).SendAsync("AdminTypingStatus", new
                {
                    isTyping = isTyping
                });
            }
        }
    }
}
