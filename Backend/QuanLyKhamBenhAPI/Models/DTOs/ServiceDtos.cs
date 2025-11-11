namespace QuanLyKhamBenhAPI.Models.DTOs
{
    public class ServiceDto
    {
        public int ServiceId { get; set; }
        public required string Name { get; set; }
        public decimal Price { get; set; }
        public required string Type { get; set; }
    }

    public class CreateServiceDto
    {
        public required string Name { get; set; }
        public decimal Price { get; set; }
        public required string Type { get; set; }
    }

    public class UpdateServiceDto
    {
        public required string Name { get; set; }
        public decimal Price { get; set; }
        public required string Type { get; set; }
    }
}