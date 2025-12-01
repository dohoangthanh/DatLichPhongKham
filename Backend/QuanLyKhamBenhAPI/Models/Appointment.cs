using System;
using System.Collections.Generic;

namespace QuanLyKhamBenhAPI.Models;

public partial class Appointment
{
    public int AppointmentId { get; set; }

    public DateOnly Date { get; set; }

    public TimeOnly Time { get; set; }

    public string Status { get; set; } = null!;

    public int? PatientId { get; set; }

    public int? DoctorId { get; set; }

    public virtual ICollection<AppointmentService> AppointmentServices { get; set; } = new List<AppointmentService>();

    public virtual Doctor? Doctor { get; set; }

    public virtual ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();

    public virtual Patient? Patient { get; set; }

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
