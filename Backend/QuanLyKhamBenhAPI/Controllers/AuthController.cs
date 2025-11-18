using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyKhamBenhAPI.Services;
using QuanLyKhamBenhAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace QuanLyKhamBenhAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly QuanLyKhamBenhContext _context;

        public AuthController(IAuthService authService, QuanLyKhamBenhContext context)
        {
            _authService = authService;
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var token = await _authService.AuthenticateAsync(request.Username, request.Password);
            if (token == null)
            {
                return Unauthorized("Invalid credentials");
            }
            return Ok(new { Token = token });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var success = await _authService.RegisterAsync(request.Username, request.Password, request.Name, request.Phone, request.Address);
            if (!success)
            {
                return BadRequest("User already exists or invalid data");
            }
            return Ok("User registered successfully");
        }

        [HttpPost("setup-admin")]
        public async Task<IActionResult> SetupAdmin([FromBody] RegisterUserRequest request)
        {
            // Only allow if no Admin exists (flexible for new DBs)
            if (await _context.UserAccounts.AnyAsync(u => u.Role == "Admin"))
            {
                return BadRequest("Admin already exists. Use /api/auth/register-user with Admin token to create more.");
            }

            var success = await _authService.RegisterUserAsync(request.Username, request.Password, "Admin", null, null);
            if (!success)
            {
                return BadRequest("Failed to create Admin");
            }
            return Ok("Admin created successfully. Setup is now disabled for this DB.");
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("register-user")]
        public async Task<IActionResult> RegisterUser([FromBody] RegisterUserRequest request)
        {
            var success = await _authService.RegisterUserAsync(request.Username, request.Password, request.Role, request.DoctorId, request.PatientId);
            if (!success)
            {
                return BadRequest("Failed to register user or user already exists");
            }
            return Ok("User registered successfully");
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var usernameClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(usernameClaim))
                return Unauthorized();

            var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.Username == usernameClaim);
            if (user == null)
                return NotFound(new { Message = "Không tìm thấy tài khoản" });

            // Verify old password
            if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash))
            {
                return BadRequest(new { Message = "Mật khẩu cũ không đúng" });
            }

            // Update password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đổi mật khẩu thành công" });
        }
    }

    public class LoginRequest
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
    }

    public class RegisterRequest
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string Name { get; set; }
        public required string Phone { get; set; }
        public required string Address { get; set; }
    }

    public class RegisterUserRequest
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string Role { get; set; }
        public int? DoctorId { get; set; }
        public int? PatientId { get; set; }
    }

    public class ChangePasswordRequest
    {
        public required string OldPassword { get; set; }
        public required string NewPassword { get; set; }
    }
}