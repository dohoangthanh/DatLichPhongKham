using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;
using QuanLyKhamBenhAPI.Services;
using System.Security.Claims;

namespace QuanLyKhamBenhAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatbotController : ControllerBase
{
    private readonly ChatbotService _chatbotService;
    private readonly QuanLyKhamBenhContext _context;
    private readonly ILogger<ChatbotController> _logger;

    public ChatbotController(
        ChatbotService chatbotService,
        QuanLyKhamBenhContext context,
        ILogger<ChatbotController> logger)
    {
        _chatbotService = chatbotService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Gửi tin nhắn đến chatbot và nhận phản hồi
    /// </summary>
    [HttpPost("chat")]
    [Authorize]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new { error = "Tin nhắn không được để trống" });
            }

            // Lấy thông tin user từ token
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized();
            }

            var userAccount = await _context.UserAccounts
                .FirstOrDefaultAsync(u => u.Username == username);

            if (userAccount == null)
            {
                return Unauthorized();
            }

            // Lấy context data nếu là bệnh nhân
            PatientContextData? contextData = null;
            if (userAccount.PatientId.HasValue)
            {
                contextData = await GetPatientContextAsync(userAccount.PatientId.Value);
            }

            // Gọi chatbot service
            var response = await _chatbotService.GetChatResponseAsync(
                request.Message, 
                contextData);

            return Ok(new ChatResponse
            {
                Message = response,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chat request");
            return StatusCode(500, new { error = "Đã có lỗi xảy ra. Vui lòng thử lại sau." });
        }
    }

    /// <summary>
    /// Lấy context data của bệnh nhân để cung cấp cho AI
    /// </summary>
    private async Task<PatientContextData> GetPatientContextAsync(int patientId)
    {
        var patient = await _context.Patients.FindAsync(patientId);
        
        if (patient == null)
        {
            return new PatientContextData();
        }

        // Lấy 5 lịch sử khám gần nhất
        var lichSuKham = await _context.MedicalRecords
            .Include(mr => mr.Appointment)
                .ThenInclude(a => a!.Doctor)
                    .ThenInclude(d => d!.Specialty)
            .Where(mr => mr.Appointment!.PatientId == patientId)
            .OrderByDescending(mr => mr.CreatedDate)
            .Take(5)
            .Select(mr => new LichSuKhamItem
            {
                Ngay = mr.Appointment!.Date.ToString("dd/MM/yyyy"),
                BacSi = mr.Appointment.Doctor!.Name,
                ChuyenKhoa = mr.Appointment.Doctor.Specialty!.Name,
                ChanDoan = mr.Diagnosis,
                DieuTri = mr.Treatment
            })
            .ToListAsync();

        // Lấy lịch hẹn sắp tới
        var today = DateOnly.FromDateTime(DateTime.Today);
        var lichHenSapToi = await _context.Appointments
            .Include(a => a.Doctor)
                .ThenInclude(d => d!.Specialty)
            .Where(a => a.PatientId == patientId 
                && a.Date >= today
                && (a.Status == "Pending" || a.Status == "Confirmed"))
            .OrderBy(a => a.Date)
            .ThenBy(a => a.Time)
            .Select(a => new LichHenSapToiItem
            {
                Ngay = a.Date.ToString("dd/MM/yyyy"),
                Gio = a.Time.ToString(@"hh\:mm"),
                BacSi = a.Doctor!.Name,
                ChuyenKhoa = a.Doctor.Specialty!.Name
            })
            .FirstOrDefaultAsync();

        // Lấy danh sách chuyên khoa
        var chuyenKhoa = await _context.Specialties
            .Select(s => s.Name!)
            .ToListAsync();

        // Tính tuổi
        int? tuoi = null;
        if (patient.Dob.HasValue)
        {
            var today2 = DateTime.Today;
            var dob = patient.Dob.Value.ToDateTime(TimeOnly.MinValue);
            tuoi = today2.Year - dob.Year;
            if (dob.Date > today2.AddYears(-tuoi.Value)) tuoi--;
        }

        return new PatientContextData
        {
            Ten = patient.Name,
            Tuoi = tuoi,
            GioiTinh = patient.Gender,
            LichSuKham = lichSuKham,
            LichHenSapToi = lichHenSapToi,
            ChuyenKhoaCuaPhongKham = chuyenKhoa
        };
    }

    /// <summary>
    /// Lấy danh sách chuyên khoa (public endpoint)
    /// </summary>
    [HttpGet("specialties")]
    public async Task<IActionResult> GetSpecialties()
    {
        try
        {
            var specialties = await _context.Specialties
                .Select(s => new { s.SpecialtyId, s.Name, s.Description })
                .ToListAsync();

            return Ok(specialties);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting specialties");
            return StatusCode(500, new { error = "Không thể lấy danh sách chuyên khoa" });
        }
    }
}

// DTOs
public class ChatRequest
{
    public string Message { get; set; } = string.Empty;
}

public class ChatResponse
{
    public string Message { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}