using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace QuanLyKhamBenhAPI.Hubs
{
    public class CustomUserIdProvider : IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext connection)
        {
            // Thử lấy từ ClaimTypes.NameIdentifier trước, nếu không có thì lấy từ custom claim "userId"
            var userId = connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? connection.User?.FindFirst("userId")?.Value;

            return userId;
        }
    }
}
