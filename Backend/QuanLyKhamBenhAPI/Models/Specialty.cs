using System;
using System.Collections.Generic;

namespace QuanLyKhamBenhAPI.Models;

public partial class Specialty
{
    public int SpecialtyId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public virtual ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
}
