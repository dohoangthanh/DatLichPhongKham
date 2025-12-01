using System;
using System.Collections.Generic;

namespace QuanLyKhamBenhAPI.Models;

public partial class Feedback
{
    public int FeedbackId { get; set; }

    public int? Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime? CreatedDate { get; set; }

    public int? PatientId { get; set; }

    public int? DoctorId { get; set; }

    public string? ReplyText { get; set; }

    public DateTime? RepliedDate { get; set; }

    public virtual Doctor? Doctor { get; set; }

    public virtual Patient? Patient { get; set; }
}
