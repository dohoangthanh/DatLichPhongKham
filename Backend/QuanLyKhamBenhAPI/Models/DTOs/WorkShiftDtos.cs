namespace QuanLyKhamBenhAPI.Models.DTOs
{
    public class WorkShiftDto
    {
        public int ShiftId { get; set; }
        public int DoctorId { get; set; }
        public required string Date { get; set; } // yyyy-MM-dd
        public required string StartTime { get; set; } // HH:mm
        public required string EndTime { get; set; } // HH:mm
    }

    public class CreateWorkShiftDto
    {
        public int DoctorId { get; set; }
        public required string Date { get; set; }
        public required string StartTime { get; set; }
        public required string EndTime { get; set; }
    }
}