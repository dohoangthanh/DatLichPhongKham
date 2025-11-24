using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace QuanLyKhamBenhAPI.Models;

public partial class QuanLyKhamBenhContext : DbContext
{
    public QuanLyKhamBenhContext()
    {
    }

    public QuanLyKhamBenhContext(DbContextOptions<QuanLyKhamBenhContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Appointment> Appointments { get; set; }

    public virtual DbSet<AppointmentService> AppointmentServices { get; set; }

    public virtual DbSet<AppSetting> AppSettings { get; set; }

    public virtual DbSet<Doctor> Doctors { get; set; }

    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<LabResult> LabResults { get; set; }

    public virtual DbSet<LoyaltyPoint> LoyaltyPoints { get; set; }

    public virtual DbSet<MedicalRecord> MedicalRecords { get; set; }

    public virtual DbSet<Patient> Patients { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<PaymentPromotion> PaymentPromotions { get; set; }

    public virtual DbSet<Promotion> Promotions { get; set; }

    public virtual DbSet<Service> Services { get; set; }

    public virtual DbSet<Specialty> Specialties { get; set; }

    public virtual DbSet<UserAccount> UserAccounts { get; set; }

    public virtual DbSet<WorkShift> WorkShifts { get; set; }

    public virtual DbSet<PasswordResetOtp> PasswordResetOtps { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(e => e.AppointmentId).HasName("PK__Appointm__D06765FEECC8698C");

            entity.ToTable("Appointment");

            entity.Property(e => e.AppointmentId).HasColumnName("appointmentId");
            entity.Property(e => e.Date).HasColumnName("date");
            entity.Property(e => e.DoctorId).HasColumnName("doctorId");
            entity.Property(e => e.PatientId).HasColumnName("patientId");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasColumnName("status");
            entity.Property(e => e.Time).HasColumnName("time");

            entity.HasOne(d => d.Doctor).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.DoctorId)
                .HasConstraintName("FK__Appointme__docto__46E78A0C");

            entity.HasOne(d => d.Patient).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.PatientId)
                .HasConstraintName("FK__Appointme__patie__45F365D3");
        });

        modelBuilder.Entity<AppointmentService>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Appointm__3213E83FB9DCB773");

            entity.ToTable("AppointmentService");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AppointmentId).HasColumnName("appointmentId");
            entity.Property(e => e.ServiceId).HasColumnName("serviceId");

            entity.HasOne(d => d.Appointment).WithMany(p => p.AppointmentServices)
                .HasForeignKey(d => d.AppointmentId)
                .HasConstraintName("FK__Appointme__appoi__4BAC3F29");

            entity.HasOne(d => d.Service).WithMany(p => p.AppointmentServices)
                .HasForeignKey(d => d.ServiceId)
                .HasConstraintName("FK__Appointme__servi__4CA06362");
        });

        modelBuilder.Entity<Doctor>(entity =>
        {
            entity.HasKey(e => e.DoctorId).HasName("PK__Doctor__7224847680FA0289");

            entity.ToTable("Doctor");

            entity.Property(e => e.DoctorId).HasColumnName("doctorId");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .HasColumnName("phone");
            entity.Property(e => e.SpecialtyId).HasColumnName("specialtyId");

            entity.HasOne(d => d.Specialty).WithMany(p => p.Doctors)
                .HasForeignKey(d => d.SpecialtyId)
                .HasConstraintName("FK__Doctor__specialt__398D8EEE");
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__Feedback__2613FD24E68EE594");

            entity.ToTable("Feedback");

            entity.Property(e => e.FeedbackId).HasColumnName("feedbackId");
            entity.Property(e => e.Comment)
                .HasMaxLength(500)
                .HasColumnName("comment");
            entity.Property(e => e.CreatedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("createdDate");
            entity.Property(e => e.DoctorId).HasColumnName("doctorId");
            entity.Property(e => e.PatientId).HasColumnName("patientId");
            entity.Property(e => e.Rating).HasColumnName("rating");

            entity.HasOne(d => d.Doctor).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.DoctorId)
                .HasConstraintName("FK__Feedback__doctor__68487DD7");

            entity.HasOne(d => d.Patient).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.PatientId)
                .HasConstraintName("FK__Feedback__patien__6754599E");
        });

        modelBuilder.Entity<LabResult>(entity =>
        {
            entity.HasKey(e => e.ResultId).HasName("PK__LabResul__C6EADC5B3EA11DC3");

            entity.ToTable("LabResult");

            entity.Property(e => e.ResultId).HasColumnName("resultId");
            entity.Property(e => e.RecordId).HasColumnName("recordId");
            entity.Property(e => e.ResultDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("resultDate");
            entity.Property(e => e.ResultDetails)
                .HasMaxLength(1000)
                .HasColumnName("resultDetails");

            entity.HasOne(d => d.Record).WithMany(p => p.LabResults)
                .HasForeignKey(d => d.RecordId)
                .HasConstraintName("FK__LabResult__recor__5441852A");
        });

        modelBuilder.Entity<LoyaltyPoint>(entity =>
        {
            entity.HasKey(e => e.PointsId).HasName("PK__LoyaltyP__1EA67FA8ED442AEE");

            entity.Property(e => e.PointsId).HasColumnName("pointsId");
            entity.Property(e => e.LastUpdated)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("lastUpdated");
            entity.Property(e => e.PatientId).HasColumnName("patientId");
            entity.Property(e => e.Points)
                .HasDefaultValue(0)
                .HasColumnName("points");

            entity.HasOne(d => d.Patient).WithMany(p => p.LoyaltyPoints)
                .HasForeignKey(d => d.PatientId)
                .HasConstraintName("FK__LoyaltyPo__patie__628FA481");
        });

        modelBuilder.Entity<MedicalRecord>(entity =>
        {
            entity.HasKey(e => e.RecordId).HasName("PK__MedicalR__D825195E5D123E61");

            entity.ToTable("MedicalRecord");

            entity.Property(e => e.RecordId).HasColumnName("recordId");
            entity.Property(e => e.AppointmentId).HasColumnName("appointmentId");
            entity.Property(e => e.CreatedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("createdDate");
            entity.Property(e => e.Diagnosis)
                .HasMaxLength(500)
                .HasColumnName("diagnosis");
            entity.Property(e => e.Symptoms)
                .HasMaxLength(500)
                .HasColumnName("symptoms");
            entity.Property(e => e.Treatment)
                .HasMaxLength(500)
                .HasColumnName("treatment");

            entity.HasOne(d => d.Appointment).WithMany(p => p.MedicalRecords)
                .HasForeignKey(d => d.AppointmentId)
                .HasConstraintName("FK__MedicalRe__appoi__5070F446");
        });

        modelBuilder.Entity<Patient>(entity =>
        {
            entity.HasKey(e => e.PatientId).HasName("PK__Patient__A17005EC6575D4A7");

            entity.ToTable("Patient");

            entity.Property(e => e.PatientId).HasColumnName("patientId");
            entity.Property(e => e.Address)
                .HasMaxLength(255)
                .HasColumnName("address");
            entity.Property(e => e.Dob).HasColumnName("dob");
            entity.Property(e => e.Gender)
                .HasMaxLength(10)
                .HasColumnName("gender");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .HasColumnName("phone");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payment__A0D9EFC6E22338D3");

            entity.ToTable("Payment");

            entity.Property(e => e.PaymentId).HasColumnName("paymentId");
            entity.Property(e => e.AppointmentId).HasColumnName("appointmentId");
            entity.Property(e => e.PaymentDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("paymentDate");
            entity.Property(e => e.PaymentMethod)
                .HasMaxLength(50)
                .HasColumnName("paymentMethod");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasColumnName("status");
            entity.Property(e => e.TotalAmount)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("totalAmount");

            entity.HasOne(d => d.Appointment).WithMany(p => p.Payments)
                .HasForeignKey(d => d.AppointmentId)
                .HasConstraintName("FK__Payment__appoint__5812160E");
        });

        modelBuilder.Entity<PaymentPromotion>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__PaymentP__3213E83FB9B7E1C8");

            entity.ToTable("PaymentPromotion");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PaymentId).HasColumnName("paymentId");
            entity.Property(e => e.PromoId).HasColumnName("promoId");

            entity.HasOne(d => d.Payment).WithMany(p => p.PaymentPromotions)
                .HasForeignKey(d => d.PaymentId)
                .HasConstraintName("FK__PaymentPr__payme__5CD6CB2B");

            entity.HasOne(d => d.Promo).WithMany(p => p.PaymentPromotions)
                .HasForeignKey(d => d.PromoId)
                .HasConstraintName("FK__PaymentPr__promo__5DCAEF64");
        });

        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasKey(e => e.PromoId).HasName("PK__Promotio__E19E71F6D52E2CA9");

            entity.ToTable("Promotion");

            entity.Property(e => e.PromoId).HasColumnName("promoId");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasColumnName("description");
            entity.Property(e => e.DiscountPercent)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("discountPercent");
            entity.Property(e => e.EndDate).HasColumnName("endDate");
            entity.Property(e => e.StartDate).HasColumnName("startDate");
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasKey(e => e.ServiceId).HasName("PK__Service__455070DF9211E9E6");

            entity.ToTable("Service");

            entity.Property(e => e.ServiceId).HasColumnName("serviceId");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Price)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("price");
            entity.Property(e => e.Type)
                .HasMaxLength(50)
                .HasColumnName("type");
        });

        modelBuilder.Entity<Specialty>(entity =>
        {
            entity.HasKey(e => e.SpecialtyId).HasName("PK__Specialt__81FB91AEE20C0732");

            entity.ToTable("Specialty");

            entity.Property(e => e.SpecialtyId).HasColumnName("specialtyId");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasColumnName("description");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
        });

        modelBuilder.Entity<UserAccount>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__UserAcco__CB9A1CFFF0632199");

            entity.ToTable("UserAccount");

            entity.HasIndex(e => e.Username, "UQ__UserAcco__F3DBC57263F32EF0").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("userId");
            entity.Property(e => e.DoctorId).HasColumnName("doctorId");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .HasColumnName("passwordHash");
            entity.Property(e => e.PatientId).HasColumnName("patientId");
            entity.Property(e => e.Role)
                .HasMaxLength(20)
                .HasColumnName("role");
            entity.Property(e => e.Username)
                .HasMaxLength(50)
                .HasColumnName("username");

            entity.HasOne(d => d.Doctor).WithMany(p => p.UserAccounts)
                .HasForeignKey(d => d.DoctorId)
                .HasConstraintName("FK__UserAccou__docto__3F466844");

            entity.HasOne(d => d.Patient).WithMany(p => p.UserAccounts)
                .HasForeignKey(d => d.PatientId)
                .HasConstraintName("FK__UserAccou__patie__403A8C7D");
        });

        modelBuilder.Entity<WorkShift>(entity =>
        {
            entity.HasKey(e => e.ShiftId).HasName("PK__WorkShif__F2F06B02BBC70987");

            entity.ToTable("WorkShift");

            entity.Property(e => e.ShiftId).HasColumnName("shiftId");
            entity.Property(e => e.Date).HasColumnName("date");
            entity.Property(e => e.DoctorId).HasColumnName("doctorId");
            entity.Property(e => e.EndTime).HasColumnName("endTime");
            entity.Property(e => e.StartTime).HasColumnName("startTime");

            entity.HasOne(d => d.Doctor).WithMany(p => p.WorkShifts)
                .HasForeignKey(d => d.DoctorId)
                .HasConstraintName("FK__WorkShift__docto__4316F928");

            modelBuilder.Entity<AppSetting>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Key).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Value).IsRequired().HasMaxLength(500);
            });
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
