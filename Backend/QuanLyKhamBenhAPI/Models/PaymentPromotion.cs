using System;
using System.Collections.Generic;

namespace QuanLyKhamBenhAPI.Models;

public partial class PaymentPromotion
{
    public int Id { get; set; }

    public int? PaymentId { get; set; }

    public int? PromoId { get; set; }

    public virtual Payment? Payment { get; set; }

    public virtual Promotion? Promo { get; set; }
}
