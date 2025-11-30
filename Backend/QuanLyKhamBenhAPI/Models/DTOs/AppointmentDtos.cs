namespace QuanLyKhamBenhAPI.Models.DTOs
{
    public class AppointmentSummaryDto
    {
        public int AppointmentId { get; set; }
        public required string Date { get; set; }
        public required string Time { get; set; }
        public required string Status { get; set; }
        public DoctorSummaryDto? Doctor { get; set; }
        public PatientSummaryDto? Patient { get; set; }
    }

    public class PatientSummaryDto
    {
        public int PatientId { get; set; }
        public required string Name { get; set; }
        public string? Phone { get; set; }
        public string? Dob { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
    }

    public class DoctorSummaryDto
    {
        public int DoctorId { get; set; }
        public required string Name { get; set; }
        public required string SpecialtyName { get; set; }
        public string? Phone { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class CreateAppointmentDto
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public required string Date { get; set; } // yyyy-MM-dd
        public required string Time { get; set; } // HH:mm
    }

    public class UpdateAppointmentDto
    {
        public required string Status { get; set; }
    }
}