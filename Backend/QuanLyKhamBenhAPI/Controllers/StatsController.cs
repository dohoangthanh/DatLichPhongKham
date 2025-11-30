using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;
using QuanLyKhamBenhAPI.Models.DTOs;

namespace QuanLyKhamBenhAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class StatsController : ControllerBase
{
    private readonly QuanLyKhamBenhContext _context;

    public StatsController(QuanLyKhamBenhContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy thống kê doanh thu theo khoảng thời gian
    /// </summary>
    [HttpGet("revenue")]
    public async Task<ActionResult<RevenueStatsDto>> GetRevenueStats(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        try
        {
            var fromDate = from ?? DateTime.Now.AddMonths(-3);
            var toDate = to ?? DateTime.Now;

            // Ensure toDate includes the entire day
            toDate = toDate.Date.AddDays(1).AddSeconds(-1);

            var payments = await _context.Payments
                .Include(p => p.Appointment)
                .Where(p => p.Status == "Paid" && 
                            p.PaymentDate.HasValue &&
                            p.PaymentDate.Value >= fromDate && 
                            p.PaymentDate.Value <= toDate)
                .ToListAsync();

            Console.WriteLine($"[Revenue Stats] Date range: {fromDate:yyyy-MM-dd} to {toDate:yyyy-MM-dd}");
            Console.WriteLine($"[Revenue Stats] Found {payments.Count} paid payments");

            var totalRevenue = payments.Sum(p => p.TotalAmount);
            var totalPayments = payments.Count;

            // Thống kê theo ngày
            var dailyRevenue = payments
                .GroupBy(p => p.PaymentDate!.Value.Date)
                .Select(g => new DailyRevenueDto
                {
                    Date = g.Key,
                    Revenue = g.Sum(p => p.TotalAmount),
                    PaymentCount = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToList();

            // Thống kê theo tháng
            var monthlyRevenue = payments
                .GroupBy(p => new { 
                    Year = p.PaymentDate!.Value.Year, 
                    Month = p.PaymentDate.Value.Month 
                })
                .Select(g => new MonthlyRevenueDto
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Revenue = g.Sum(p => p.TotalAmount),
                    PaymentCount = g.Count()
                })
                .OrderBy(m => m.Year).ThenBy(m => m.Month)
                .ToList();

            var result = new RevenueStatsDto
            {
                TotalRevenue = totalRevenue,
                TotalPayments = totalPayments,
                DailyRevenue = dailyRevenue,
                MonthlyRevenue = monthlyRevenue
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy thống kê doanh thu", error = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách bệnh nhân có lượt khám nhiều nhất
    /// </summary>
    [HttpGet("top-patients")]
    public async Task<ActionResult<List<TopPatientDto>>> GetTopPatients(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int limit = 10)
    {
        try
        {
            var fromDate = from ?? DateTime.Now.AddMonths(-3);
            var toDate = to ?? DateTime.Now;
            
            // Ensure toDate includes the entire day
            toDate = toDate.Date.AddDays(1).AddSeconds(-1);

            // Fetch all completed appointments first, then process in memory
            var appointments = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Payments)
                .Where(a => a.Status == "Completed" &&
                            a.PatientId != null &&
                            a.Date >= DateOnly.FromDateTime(fromDate) &&
                            a.Date <= DateOnly.FromDateTime(toDate))
                .ToListAsync();

            var topPatients = appointments
                .GroupBy(a => new { a.PatientId, a.Patient!.Name, a.Patient.Phone })
                .Select(g => new TopPatientDto
                {
                    PatientId = g.Key.PatientId!.Value,
                    PatientName = g.Key.Name,
                    Phone = g.Key.Phone,
                    AppointmentCount = g.Count(),
                    TotalSpent = g.SelectMany(a => a.Payments)
                                  .Where(p => p.Status == "Paid")
                                  .Sum(p => p.TotalAmount),
                    LastVisit = g.Max(a => new DateTime(a.Date.Year, a.Date.Month, a.Date.Day))
                })
                .OrderByDescending(p => p.AppointmentCount)
                .Take(limit)
                .ToList();

            return Ok(topPatients);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy thống kê bệnh nhân", error = ex.Message });
        }
    }

    /// <summary>
    /// Lấy tổng quan thống kê dashboard
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        try
        {
            var currentMonth = DateTime.Now.Month;
            var currentYear = DateTime.Now.Year;

            var totalPatients = await _context.Patients.CountAsync();
            var totalDoctors = await _context.Doctors.CountAsync();
            var totalAppointments = await _context.Appointments.CountAsync();

            var completedAppointments = await _context.Appointments
                .CountAsync(a => a.Status == "Completed");

            var pendingAppointments = await _context.Appointments
                .CountAsync(a => a.Status == "Pending" || a.Status == "Scheduled");

            var cancelledAppointments = await _context.Appointments
                .CountAsync(a => a.Status == "Cancelled");

            var totalRevenue = await _context.Payments
                .Where(p => p.Status == "Paid")
                .SumAsync(p => p.TotalAmount);

            var monthlyRevenue = await _context.Payments
                .Where(p => p.Status == "Paid" && 
                            p.PaymentDate.HasValue &&
                            p.PaymentDate.Value.Month == currentMonth &&
                            p.PaymentDate.Value.Year == currentYear)
                .SumAsync(p => p.TotalAmount);

            var result = new DashboardStatsDto
            {
                TotalPatients = totalPatients,
                TotalDoctors = totalDoctors,
                TotalAppointments = totalAppointments,
                CompletedAppointments = completedAppointments,
                PendingAppointments = pendingAppointments,
                CancelledAppointments = cancelledAppointments,
                TotalRevenue = totalRevenue,
                MonthlyRevenue = monthlyRevenue
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy thống kê tổng quan", error = ex.Message });
        }
    }

    /// <summary>
    /// Thống kê lịch hẹn theo trạng thái
    /// </summary>
    [HttpGet("appointments/by-status")]
    public async Task<ActionResult<List<AppointmentStatsByStatusDto>>> GetAppointmentStatsByStatus(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        try
        {
            var fromDate = from ?? DateTime.Now.AddMonths(-3);
            var toDate = to ?? DateTime.Now;
            
            // Ensure toDate includes the entire day
            toDate = toDate.Date.AddDays(1).AddSeconds(-1);

            var totalAppointments = await _context.Appointments
                .Where(a => a.Date >= DateOnly.FromDateTime(fromDate) &&
                            a.Date <= DateOnly.FromDateTime(toDate))
                .CountAsync();

            if (totalAppointments == 0)
            {
                return Ok(new List<AppointmentStatsByStatusDto>());
            }

            var stats = await _context.Appointments
                .Where(a => a.Date >= DateOnly.FromDateTime(fromDate) &&
                            a.Date <= DateOnly.FromDateTime(toDate))
                .GroupBy(a => a.Status)
                .Select(g => new AppointmentStatsByStatusDto
                {
                    Status = g.Key,
                    Count = g.Count(),
                    Percentage = Math.Round((decimal)g.Count() / totalAppointments * 100, 2)
                })
                .OrderByDescending(s => s.Count)
                .ToListAsync();

            return Ok(stats);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy thống kê lịch hẹn", error = ex.Message });
        }
    }

    /// <summary>
    /// Thống kê theo chuyên khoa
    /// </summary>
    [HttpGet("appointments/by-specialty")]
    public async Task<ActionResult<List<AppointmentStatsBySpecialtyDto>>> GetAppointmentStatsBySpecialty(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        try
        {
            var fromDate = from ?? DateTime.Now.AddMonths(-3);
            var toDate = to ?? DateTime.Now;
            
            // Ensure toDate includes the entire day
            toDate = toDate.Date.AddDays(1).AddSeconds(-1);

            var stats = await _context.Appointments
                .Include(a => a.Doctor)
                    .ThenInclude(d => d!.Specialty)
                .Include(a => a.Payments)
                .Where(a => a.Date >= DateOnly.FromDateTime(fromDate) &&
                            a.Date <= DateOnly.FromDateTime(toDate) &&
                            a.Doctor != null && 
                            a.Doctor.Specialty != null)
                .GroupBy(a => a.Doctor!.Specialty!.Name)
                .Select(g => new AppointmentStatsBySpecialtyDto
                {
                    SpecialtyName = g.Key,
                    AppointmentCount = g.Count(),
                    Revenue = g.SelectMany(a => a.Payments)
                               .Where(p => p.Status == "Paid")
                               .Sum(p => p.TotalAmount)
                })
                .OrderByDescending(s => s.AppointmentCount)
                .ToListAsync();

            return Ok(stats);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy thống kê chuyên khoa", error = ex.Message });
        }
    }

    /// <summary>
    /// Debug endpoint: Lấy thông tin về payments để kiểm tra
    /// </summary>
    [HttpGet("debug/payments")]
    public async Task<ActionResult> GetPaymentsDebug()
    {
        try
        {
            var totalPayments = await _context.Payments.CountAsync();
            var paidPayments = await _context.Payments.CountAsync(p => p.Status == "Paid");
            var paymentsWithDate = await _context.Payments.CountAsync(p => p.PaymentDate.HasValue);
            
            var recentPayments = await _context.Payments
                .OrderByDescending(p => p.PaymentId)
                .Take(5)
                .Select(p => new {
                    p.PaymentId,
                    p.Status,
                    p.TotalAmount,
                    p.PaymentDate,
                    p.AppointmentId
                })
                .ToListAsync();

            return Ok(new {
                totalPayments,
                paidPayments,
                paymentsWithDate,
                recentPayments,
                message = $"Tổng: {totalPayments}, Paid: {paidPayments}, Có ngày: {paymentsWithDate}"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi", error = ex.Message });
        }
    }
}
