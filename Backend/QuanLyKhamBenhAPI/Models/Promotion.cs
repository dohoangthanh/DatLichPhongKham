using System;
using System.Collections.Generic;

namespace QuanLyKhamBenhAPI.Models;

public partial class Promotion
{
    public int PromoId { get; set; }

    public string? Description { get; set; }

    public decimal? DiscountPercent { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public virtual ICollection<PaymentPromotion> PaymentPromotions { get; set; } = new List<PaymentPromotion>();
}
