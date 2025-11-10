using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;
using QuanLyKhamBenhAPI.Models;

namespace QuanLyKhamBenhAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly QuanLyKhamBenhContext _context;
        private readonly string _jwtSecret;

        public AuthService(QuanLyKhamBenhContext context, string jwtSecret)
        {
            _context = context;
            _jwtSecret = jwtSecret;
        }

        public async Task<string> AuthenticateAsync(string username, string password)
        {
            // Implement authentication logic here
            // For example, check against UserAccount table
            var user = _context.UserAccounts.FirstOrDefault(u => u.Username == username);
            if (user == null || !VerifyPassword(password, user.PasswordHash))
            {
                return null;
            }

            // Generate JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSecret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<bool> RegisterAsync(string username, string password, string name, string phone, string address)
        {
            // Check if username already exists
            if (_context.UserAccounts.Any(u => u.Username == username))
            {
                return false;
            }

            // Create new Patient
            var patient = new Patient
            {
                Name = name,
                Phone = phone,
                Address = address
            };

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync(); // Save to get PatientId

            // Create UserAccount linked to Patient
            var userAccount = new UserAccount
            {
                Username = username,
                PasswordHash = HashPassword(password),
                Role = "Patient", // Default role for patients
                PatientId = patient.PatientId
            };

            _context.UserAccounts.Add(userAccount);
            await _context.SaveChangesAsync();
            return true;
        }

        private bool VerifyPassword(string password, string hash)
        {
            // Simple verification (in production, use proper hashing like BCrypt)
            return HashPassword(password) == hash;
        }

        private string HashPassword(string password)
        {
            // Simple hashing (in production, use BCrypt or similar)
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(password);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }
    }
}