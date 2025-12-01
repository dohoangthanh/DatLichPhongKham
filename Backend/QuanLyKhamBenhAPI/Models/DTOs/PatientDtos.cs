namespace QuanLyKhamBenhAPI.Models.DTOs
{
    public class PatientDto
    {
        public int PatientId { get; set; }
        public required string Name { get; set; }
        public required string Dob { get; set; } // yyyy-MM-dd
        public required string Gender { get; set; }
        public required string Phone { get; set; }
        public required string Address { get; set; }
    }

    public class CreatePatientDto
    {
        public required string Name { get; set; }
        public required string Dob { get; set; }
        public required string Gender { get; set; }
        public required string Phone { get; set; }
        public required string Address { get; set; }
    }

    public class UpdatePatientDto
    {
        public required string Name { get; set; }
        public required string Dob { get; set; }
        public required string Gender { get; set; }
        public required string Phone { get; set; }
        public required string Address { get; set; }
    }
}