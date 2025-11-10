using System;
using System.Collections.Generic;

namespace QuanLyKhamBenhAPI.Models;

public partial class Payment
{
    public int PaymentId { get; set; }

    public decimal TotalAmount { get; set; }

    public string? PaymentMethod { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? PaymentDate { get; set; }

    public int? AppointmentId { get; set; }

    public virtual Appointment? Appointment { get; set; }

    public virtual ICollection<PaymentPromotion> PaymentPromotions { get; set; } = new List<PaymentPromotion>();
}
