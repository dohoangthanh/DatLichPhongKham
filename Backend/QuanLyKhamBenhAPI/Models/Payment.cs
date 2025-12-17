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

    // ZaloPay fields
    public string? ZaloPayTransId { get; set; }
    public string? ZaloPayTransToken { get; set; }
    public string? QrCodeUrl { get; set; }

    // Bank Transfer / Casso fields
    public string? TransferContent { get; set; }  // Nội dung chuyển khoản (VD: "THANHTOAN 123")
    public string? TransactionId { get; set; }     // Mã giao dịch ngân hàng (tid từ Casso)

    public virtual Appointment? Appointment { get; set; }

    public virtual ICollection<PaymentPromotion> PaymentPromotions { get; set; } = new List<PaymentPromotion>();
}
