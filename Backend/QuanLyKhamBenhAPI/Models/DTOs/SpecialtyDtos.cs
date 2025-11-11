namespace QuanLyKhamBenhAPI.Models.DTOs
{
    public class SpecialtyDto
    {
        public int SpecialtyId { get; set; }
        public required string Name { get; set; }
    }

    public class CreateSpecialtyDto
    {
        public required string Name { get; set; }
    }

    public class UpdateSpecialtyDto
    {
        public required string Name { get; set; }
    }
}