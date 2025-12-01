namespace QuanLyKhamBenhAPI.Models.DTOs
{
    public class DoctorDto
    {
        public int DoctorId { get; set; }
        public required string Name { get; set; }
        public required string Phone { get; set; }
        public string? ImageUrl { get; set; }
        public SpecialtyDto? Specialty { get; set; }
    }

    public class CreateDoctorDto
    {
        public required string Name { get; set; }
        public int SpecialtyId { get; set; }
        public required string Phone { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class UpdateDoctorDto
    {
        public required string Name { get; set; }
        public int SpecialtyId { get; set; }
        public required string Phone { get; set; }
        public string? ImageUrl { get; set; }
    }
}