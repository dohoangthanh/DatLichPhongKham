namespace QuanLyKhamBenhAPI.Models.DTOs;

public class RevenueStatsDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalPayments { get; set; }
    public List<DailyRevenueDto> DailyRevenue { get; set; } = new();
    public List<MonthlyRevenueDto> MonthlyRevenue { get; set; } = new();
}

public class DailyRevenueDto
{
    public DateTime Date { get; set; }
    public decimal Revenue { get; set; }
    public int PaymentCount { get; set; }
}

public class MonthlyRevenueDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal Revenue { get; set; }
    public int PaymentCount { get; set; }
}

public class TopPatientDto
{
    public int PatientId { get; set; }
    public string PatientName { get; set; } = null!;
    public string? Phone { get; set; }
    public int AppointmentCount { get; set; }
    public decimal TotalSpent { get; set; }
    public DateTime? LastVisit { get; set; }
}

public class DashboardStatsDto
{
    public int TotalPatients { get; set; }
    public int TotalDoctors { get; set; }
    public int TotalAppointments { get; set; }
    public int CompletedAppointments { get; set; }
    public int PendingAppointments { get; set; }
    public int CancelledAppointments { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal MonthlyRevenue { get; set; }
}

public class AppointmentStatsByStatusDto
{
    public string Status { get; set; } = null!;
    public int Count { get; set; }
    public decimal Percentage { get; set; }
}

public class AppointmentStatsBySpecialtyDto
{
    public string SpecialtyName { get; set; } = null!;
    public int AppointmentCount { get; set; }
    public decimal Revenue { get; set; }
}
