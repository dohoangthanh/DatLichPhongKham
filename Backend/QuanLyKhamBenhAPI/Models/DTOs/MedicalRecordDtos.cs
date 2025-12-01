using System;
using System.Collections.Generic;

namespace QuanLyKhamBenhAPI.Models.DTOs
{
    public class MedicalRecordDto
    {
        public int RecordId { get; set; }
        public string? Symptoms { get; set; }
        public string? Diagnosis { get; set; }
        public string? Treatment { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int? AppointmentId { get; set; }
        public AppointmentForRecordDto? Appointment { get; set; }
        public List<LabResultForRecordDto> LabResults { get; set; } = new();
    }

    public class AppointmentForRecordDto
    {
        public int AppointmentId { get; set; }
        public DateOnly Date { get; set; }
        public TimeOnly Time { get; set; }
        public string? Status { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        // Loại bỏ AppointmentServices và Payments để đơn giản
        public DoctorDto? Doctor { get; set; }
        public PatientDto? Patient { get; set; }
        // Không include MedicalRecords để tránh vòng lặp
    }

    public class LabResultForRecordDto
    {
        public int ResultId { get; set; }
        public string? ResultDetails { get; set; }
        public DateTime? ResultDate { get; set; }
        public int? RecordId { get; set; }
        // Không include Record để tránh vòng lặp
    }

    public class UpdateMedicalRecordDto
    {
        public string? Symptoms { get; set; }
        public string? Diagnosis { get; set; }
        public string? Treatment { get; set; }
    }
}