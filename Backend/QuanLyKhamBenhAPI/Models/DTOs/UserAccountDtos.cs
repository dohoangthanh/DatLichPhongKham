namespace QuanLyKhamBenhAPI.Models.DTOs
{
    // DTO for creating/updating user account
    public class UserAccountDto
    {
        public int UserId { get; set; }
        public required string Username { get; set; }
        public required string Role { get; set; }
        public int? DoctorId { get; set; }
        public int? PatientId { get; set; }
    }

    public class CreateUserAccountDto
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string Role { get; set; } // "Doctor", "Patient", "Admin"
    }

    public class UpdateUserAccountDto
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
        public string? Role { get; set; }
    }

    // Extended DTOs for Doctor/Patient with account info
    public class DoctorWithAccountDto
    {
        public int DoctorId { get; set; }
        public required string Name { get; set; }
        public required string Phone { get; set; }
        public string? ImageUrl { get; set; }
        public SpecialtyDto? Specialty { get; set; }
        public UserAccountDto? UserAccount { get; set; }
    }

    public class PatientWithAccountDto
    {
        public int PatientId { get; set; }
        public required string Name { get; set; }
        public required string Dob { get; set; }
        public required string Gender { get; set; }
        public required string Phone { get; set; }
        public required string Address { get; set; }
        public UserAccountDto? UserAccount { get; set; }
    }

    // DTO for creating doctor with account
    public class CreateDoctorWithAccountDto
    {
        public required string Name { get; set; }
        public int SpecialtyId { get; set; }
        public required string Phone { get; set; }
        public string? ImageUrl { get; set; }
        public required string Username { get; set; }
        public required string Password { get; set; }
    }

    // DTO for creating patient with account
    public class CreatePatientWithAccountDto
    {
        public required string Name { get; set; }
        public required string Dob { get; set; }
        public required string Gender { get; set; }
        public required string Phone { get; set; }
        public required string Address { get; set; }
        public required string Username { get; set; }
        public required string Password { get; set; }
    }
}
