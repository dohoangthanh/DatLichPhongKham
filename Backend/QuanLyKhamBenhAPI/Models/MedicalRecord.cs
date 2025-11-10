using System;
using System.Collections.Generic;

namespace QuanLyKhamBenhAPI.Models;

public partial class MedicalRecord
{
    public int RecordId { get; set; }

    public string? Symptoms { get; set; }

    public string? Diagnosis { get; set; }

    public string? Treatment { get; set; }

    public DateTime? CreatedDate { get; set; }

    public int? AppointmentId { get; set; }

    public virtual Appointment? Appointment { get; set; }

    public virtual ICollection<LabResult> LabResults { get; set; } = new List<LabResult>();
}
