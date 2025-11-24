using System.ComponentModel;
using Microsoft.SemanticKernel;
using QuanLyKhamBenhAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace QuanLyKhamBenhAPI.Plugins;

/// <summary>
/// Plugin cho Semantic Kernel để AI có thể gọi các hàm nghiệp vụ của phòng khám
/// </summary>
public class ClinicPlugin
{
    private readonly QuanLyKhamBenhContext _context;
    private readonly ILogger<ClinicPlugin> _logger;

    public ClinicPlugin(QuanLyKhamBenhContext context, ILogger<ClinicPlugin> logger)
    {
        _context = context;
        _logger = logger;
    }

    [KernelFunction, Description("Lấy lịch sử khám bệnh 5 lần gần nhất của bệnh nhân")]
    public async Task<string> LayLichSuKhamAsync(
        [Description("Mã bệnh nhân (Patient ID)")] int patientId)
    {
        try
        {
            var records = await _context.MedicalRecords
                .Include(mr => mr.Appointment)
                    .ThenInclude(a => a!.Doctor)
                        .ThenInclude(d => d!.Specialty)
                .Include(mr => mr.Appointment)
                    .ThenInclude(a => a!.Patient)
                .Where(mr => mr.Appointment!.PatientId == patientId)
                .OrderByDescending(mr => mr.CreatedDate)
                .Take(5)
                .Select(mr => new
                {
                    Ngay = mr.Appointment!.Date.ToString("dd/MM/yyyy"),
                    BacSi = mr.Appointment.Doctor!.Name,
                    ChuyenKhoa = mr.Appointment.Doctor.Specialty!.Name,
                    TrieuChung = mr.Symptoms,
                    ChanDoan = mr.Diagnosis,
                    DieuTri = mr.Treatment
                })
                .ToListAsync();

            if (!records.Any())
            {
                return "Bệnh nhân chưa có lịch sử khám bệnh.";
            }

            return JsonSerializer.Serialize(records, new JsonSerializerOptions 
            { 
                WriteIndented = true,
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting patient history");
            return "Không thể lấy lịch sử khám bệnh.";
        }
    }

    [KernelFunction, Description("Lấy danh sách lịch hẹn sắp tới của bệnh nhân")]
    public async Task<string> LayLichHenSapToiAsync(
        [Description("Mã bệnh nhân")] int patientId)
    {
        try
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            var appointments = await _context.Appointments
                .Include(a => a.Doctor)
                    .ThenInclude(d => d!.Specialty)
                .Where(a => a.PatientId == patientId 
                    && a.Date >= today 
                    && (a.Status == "Pending" || a.Status == "Confirmed"))
                .OrderBy(a => a.Date)
                .ThenBy(a => a.Time)
                .Take(3)
                .Select(a => new
                {
                    Ngay = a.Date.ToString("dd/MM/yyyy"),
                    Gio = a.Time.ToString(@"hh\:mm"),
                    BacSi = a.Doctor!.Name,
                    ChuyenKhoa = a.Doctor.Specialty!.Name,
                    TrangThai = a.Status
                })
                .ToListAsync();

            if (!appointments.Any())
            {
                return "Bệnh nhân không có lịch hẹn sắp tới.";
            }

            return JsonSerializer.Serialize(appointments, new JsonSerializerOptions 
            { 
                WriteIndented = true,
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting upcoming appointments");
            return "Không thể lấy lịch hẹn sắp tới.";
        }
    }

    [KernelFunction, Description("Lấy danh sách bác sĩ theo chuyên khoa")]
    public async Task<string> LayDanhSachBacSiAsync(
        [Description("Tên chuyên khoa (ví dụ: Nội khoa, Ngoại khoa)")] string? chuyenKhoa = null)
    {
        try
        {
            var query = _context.Doctors
                .Include(d => d.Specialty)
                .AsQueryable();

            if (!string.IsNullOrEmpty(chuyenKhoa))
            {
                query = query.Where(d => d.Specialty!.Name!.Contains(chuyenKhoa));
            }

            var doctors = await query
                .Select(d => new
                {
                    MaBacSi = d.DoctorId,
                    TenBacSi = d.Name,
                    ChuyenKhoa = d.Specialty!.Name,
                    SoDienThoai = d.Phone
                })
                .ToListAsync();

            if (!doctors.Any())
            {
                return chuyenKhoa != null 
                    ? $"Không tìm thấy bác sĩ chuyên khoa {chuyenKhoa}."
                    : "Không tìm thấy bác sĩ.";
            }

            return JsonSerializer.Serialize(doctors, new JsonSerializerOptions 
            { 
                WriteIndented = true,
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting doctors list");
            return "Không thể lấy danh sách bác sĩ.";
        }
    }

    [KernelFunction, Description("Lấy danh sách ca làm việc trống của bác sĩ trong tuần")]
    public async Task<string> LayCaLamViecTrongAsync(
        [Description("Mã bác sĩ")] int doctorId,
        [Description("Ngày bắt đầu (format: yyyy-MM-dd)")] string? startDate = null)
    {
        try
        {
            var start = string.IsNullOrEmpty(startDate) 
                ? DateOnly.FromDateTime(DateTime.Today)
                : DateOnly.Parse(startDate);
            
            var end = start.AddDays(7);

            var workShifts = await _context.WorkShifts
                .Where(ws => ws.DoctorId == doctorId 
                    && ws.Date >= start 
                    && ws.Date <= end)
                .OrderBy(ws => ws.Date)
                .ThenBy(ws => ws.StartTime)
                .Select(ws => new
                {
                    Ngay = ws.Date.ToString("dd/MM/yyyy"),
                    GioBatDau = ws.StartTime.ToString(@"hh\:mm"),
                    GioKetThuc = ws.EndTime.ToString(@"hh\:mm")
                })
                .ToListAsync();

            if (!workShifts.Any())
            {
                return "Bác sĩ không có ca làm việc trong tuần này.";
            }

            return JsonSerializer.Serialize(workShifts, new JsonSerializerOptions 
            { 
                WriteIndented = true,
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting work shifts");
            return "Không thể lấy ca làm việc.";
        }
    }

    [KernelFunction, Description("Tìm kiếm thông tin về dịch vụ khám bệnh và giá")]
    public async Task<string> TimDichVuKhamAsync(
        [Description("Từ khóa tìm kiếm dịch vụ")] string keyword)
    {
        try
        {
            var services = await _context.Services
                .Where(s => s.Name!.Contains(keyword) || s.Type!.Contains(keyword))
                .Select(s => new
                {
                    TenDichVu = s.Name,
                    LoaiDichVu = s.Type,
                    Gia = s.Price
                })
                .ToListAsync();

            if (!services.Any())
            {
                return $"Không tìm thấy dịch vụ với từ khóa '{keyword}'.";
            }

            return JsonSerializer.Serialize(services, new JsonSerializerOptions 
            { 
                WriteIndented = true,
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching services");
            return "Không thể tìm kiếm dịch vụ.";
        }
    }
}
