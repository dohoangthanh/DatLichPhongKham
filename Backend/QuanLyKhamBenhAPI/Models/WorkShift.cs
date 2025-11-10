using System;
using System.Collections.Generic;

namespace QuanLyKhamBenhAPI.Models;

public partial class WorkShift
{
    public int ShiftId { get; set; }

    public DateOnly Date { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public int? DoctorId { get; set; }

    public virtual Doctor? Doctor { get; set; }
}
