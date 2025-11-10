using System;
using System.Collections.Generic;

namespace QuanLyKhamBenhAPI.Models;

public partial class LoyaltyPoint
{
    public int PointsId { get; set; }

    public int? Points { get; set; }

    public DateTime? LastUpdated { get; set; }

    public int? PatientId { get; set; }

    public virtual Patient? Patient { get; set; }
}
