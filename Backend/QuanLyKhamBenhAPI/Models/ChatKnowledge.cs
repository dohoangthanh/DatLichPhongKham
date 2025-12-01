namespace QuanLyKhamBenhAPI.Models
{
    public class ChatKnowledge
    {
        public int KnowledgeId { get; set; }
        public string Question { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // "general", "service", "doctor", "appointment", etc.
        public int UsageCount { get; set; } = 0;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? LastUsedDate { get; set; }
        public bool IsActive { get; set; } = true;
        public string? CreatedBy { get; set; } // Admin username
    }
}
