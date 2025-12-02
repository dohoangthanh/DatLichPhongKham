using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuanLyKhamBenhAPI.Models
{
    public class ChatMessage
    {
        [Key]
        public int MessageId { get; set; }

        [Required]
        public int PatientId { get; set; }

        public int? AdminId { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Message { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string SenderRole { get; set; } = string.Empty; // "Patient" hoặc "Admin"

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public bool IsRead { get; set; } = false;

        // Navigation properties
        [ForeignKey(nameof(PatientId))]
        public virtual UserAccount? Patient { get; set; }

        [ForeignKey(nameof(AdminId))]
        public virtual UserAccount? Admin { get; set; }
    }
}
