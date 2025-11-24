using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;
using BCrypt.Net;

namespace QuanLyKhamBenhAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ForgotPasswordController : ControllerBase
{
    private readonly QuanLyKhamBenhContext _context;
    private readonly ILogger<ForgotPasswordController> _logger;

    public ForgotPasswordController(
        QuanLyKhamBenhContext context,
        ILogger<ForgotPasswordController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Bước 1: Kiểm tra username có tồn tại không và lấy thông tin liên hệ
    /// </summary>
    [HttpPost("check-username")]
    public async Task<IActionResult> CheckUsername([FromBody] CheckUsernameRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Username))
            {
                return BadRequest(new { error = "Vui lòng nhập tên đăng nhập" });
            }

            var userAccount = await _context.UserAccounts
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (userAccount == null)
            {
                return NotFound(new { error = "Không tìm thấy tài khoản với tên đăng nhập này" });
            }

            // Lấy số điện thoại tùy theo vai trò
            string? phone = null;

            if (userAccount.PatientId.HasValue)
            {
                var patient = await _context.Patients.FindAsync(userAccount.PatientId.Value);
                if (patient != null)
                {
                    phone = patient.Phone;
                }
            }
            else if (userAccount.DoctorId.HasValue)
            {
                var doctor = await _context.Doctors.FindAsync(userAccount.DoctorId.Value);
                if (doctor != null)
                {
                    phone = doctor.Phone;
                }
            }

            // Ẩn bớt thông tin để bảo mật
            var maskedPhone = MaskPhone(phone);

            return Ok(new
            {
                username = request.Username,
                phone = maskedPhone,
                hasPhone = !string.IsNullOrEmpty(phone)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking username");
            return StatusCode(500, new { error = "Đã có lỗi xảy ra. Vui lòng thử lại sau." });
        }
    }

    /// <summary>
    /// Bước 2: Gửi mã OTP (Giả lập - trong thực tế sẽ gửi qua Email/SMS)
    /// </summary>
    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Username))
            {
                return BadRequest(new { error = "Vui lòng nhập tên đăng nhập" });
            }

            var userAccount = await _context.UserAccounts
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (userAccount == null)
            {
                return NotFound(new { error = "Không tìm thấy tài khoản" });
            }

            // Tạo mã OTP ngẫu nhiên 6 chữ số
            var otp = new Random().Next(100000, 999999).ToString();
            
            // Lưu OTP vào session/cache (đơn giản hóa: lưu vào bảng tạm)
            var otpRecord = new PasswordResetOtp
            {
                Username = request.Username,
                Otp = otp,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15), // OTP hết hạn sau 15 phút
                IsUsed = false
            };

            // Xóa các OTP cũ chưa dùng của user này
            var oldOtps = _context.PasswordResetOtps
                .Where(o => o.Username == request.Username && !o.IsUsed);
            _context.PasswordResetOtps.RemoveRange(oldOtps);

            _context.PasswordResetOtps.Add(otpRecord);
            await _context.SaveChangesAsync();

            // Giả lập gửi email/SMS (trong thực tế sẽ gọi service gửi email)
            // OTP CHỈ ĐƯỢC LOG VÀO SERVER LOG - KHÔNG BAO GIỜ GỬI VỀ CLIENT
            _logger.LogWarning($"[DEV ONLY] OTP cho {request.Username}: {otp}");
            Console.WriteLine($"═══════════════════════════════════════");
            Console.WriteLine($"OTP cho user '{request.Username}': {otp}");
            Console.WriteLine($"Hết hạn lúc: {DateTime.UtcNow.AddMinutes(15):HH:mm:ss}");
            Console.WriteLine($"═══════════════════════════════════════");

            return Ok(new
            {
                message = $"Mã xác thực đã được gửi đến {request.ContactMethod}",
                expiresIn = 15 // minutes
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending OTP");
            return StatusCode(500, new { error = "Không thể gửi mã xác thực. Vui lòng thử lại sau." });
        }
    }

    /// <summary>
    /// Bước 3: Xác thực OTP và đặt lại mật khẩu
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Username) || 
                string.IsNullOrWhiteSpace(request.Otp) || 
                string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new { error = "Vui lòng điền đầy đủ thông tin" });
            }

            // Kiểm tra OTP
            var otpRecord = await _context.PasswordResetOtps
                .Where(o => o.Username == request.Username 
                    && o.Otp == request.Otp 
                    && !o.IsUsed
                    && o.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otpRecord == null)
            {
                return BadRequest(new { error = "Mã xác thực không hợp lệ hoặc đã hết hạn" });
            }

            // Tìm user account
            var userAccount = await _context.UserAccounts
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (userAccount == null)
            {
                return NotFound(new { error = "Không tìm thấy tài khoản" });
            }

            // Kiểm tra mật khẩu mới đủ mạnh
            if (request.NewPassword.Length < 6)
            {
                return BadRequest(new { error = "Mật khẩu phải có ít nhất 6 ký tự" });
            }

            // Hash mật khẩu mới
            var newPasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            userAccount.PasswordHash = newPasswordHash;

            // Đánh dấu OTP đã sử dụng
            otpRecord.IsUsed = true;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Password reset successful for user: {request.Username}");

            return Ok(new { message = "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password");
            return StatusCode(500, new { error = "Đã có lỗi xảy ra. Vui lòng thử lại sau." });
        }
    }

    // Helper methods
    private string? MaskPhone(string? phone)
    {
        if (string.IsNullOrEmpty(phone) || phone.Length < 4)
            return null;

        return $"***{phone.Substring(phone.Length - 4)}";
    }
}

// DTOs
public class CheckUsernameRequest
{
    public string Username { get; set; } = string.Empty;
}

public class SendOtpRequest
{
    public string Username { get; set; } = string.Empty;
    public string ContactMethod { get; set; } = "email"; // "email" hoặc "phone"
}

public class ResetPasswordRequest
{
    public string Username { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
