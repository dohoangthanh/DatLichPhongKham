using System;
using System.Collections.Generic;

namespace QuanLyKhamBenhAPI.Models;

public partial class Doctor
{
    public int DoctorId { get; set; }

    public string Name { get; set; } = null!;

    public string? Phone { get; set; }

    public int? SpecialtyId { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual Specialty? Specialty { get; set; }

    public virtual ICollection<UserAccount> UserAccounts { get; set; } = new List<UserAccount>();

    public virtual ICollection<WorkShift> WorkShifts { get; set; } = new List<WorkShift>();
}
