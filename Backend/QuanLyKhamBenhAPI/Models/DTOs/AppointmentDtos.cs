namespace QuanLyKhamBenhAPI.Models.DTOs
{
    public class AppointmentSummaryDto
    {
        public int AppointmentId { get; set; }
        public required string Date { get; set; }
        public required string Time { get; set; }
        public required string Status { get; set; }
        public DoctorSummaryDto? Doctor { get; set; }
    }

    public class DoctorSummaryDto
    {
        public int DoctorId { get; set; }
        public required string Name { get; set; }
        public required string SpecialtyName { get; set; }
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