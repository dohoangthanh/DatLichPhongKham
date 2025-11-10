using System;
using System.Collections.Generic;

namespace QuanLyKhamBenhAPI.Models;

public partial class LabResult
{
    public int ResultId { get; set; }

    public string? ResultDetails { get; set; }

    public DateTime? ResultDate { get; set; }

    public int? RecordId { get; set; }

    public virtual MedicalRecord? Record { get; set; }
}
