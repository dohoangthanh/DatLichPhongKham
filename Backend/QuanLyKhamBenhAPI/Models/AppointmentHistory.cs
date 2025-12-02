using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuanLyKhamBenhAPI.Models;

public partial class AppointmentHistory
{
    [Key]
    public int HistoryId { get; set; }

    [Required]
    public int AppointmentId { get; set; }

    // Thông tin lịch cũ
    public DateOnly OldDate { get; set; }

    public TimeOnly OldTime { get; set; }

    public int? OldDoctorId { get; set; }

    // Thông tin lịch mới
    public DateOnly NewDate { get; set; }

    public TimeOnly NewTime { get; set; }

    public int? NewDoctorId { get; set; }

    // Metadata
    [Required]
    [MaxLength(50)]
    public string ChangedBy { get; set; } = null!; // 'Patient', 'Doctor', 'Admin'

    [MaxLength(500)]
    public string? ChangeReason { get; set; }

    public DateTime ChangedDate { get; set; } = DateTime.Now;

    // Navigation properties
    [ForeignKey("AppointmentId")]
    public virtual Appointment? Appointment { get; set; }

    [ForeignKey("OldDoctorId")]
    public virtual Doctor? OldDoctor { get; set; }

    [ForeignKey("NewDoctorId")]
    public virtual Doctor? NewDoctor { get; set; }
}
