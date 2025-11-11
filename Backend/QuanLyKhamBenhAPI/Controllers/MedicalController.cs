using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;
using QuanLyKhamBenhAPI.Models.DTOs;
using System.Security.Claims;

namespace QuanLyKhamBenhAPI.Controllers;

[ApiController]
[Route("api/medical")]
public class MedicalController : ControllerBase
{
    private readonly QuanLyKhamBenhContext _context;

    public MedicalController(QuanLyKhamBenhContext context)
    {
        _context = context;
    }

    // GET /api/medical/appointments
    [HttpGet("appointments")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> GetDoctorAppointments([FromQuery] string period = "today")
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Name);
        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        var userAccount = await _context.UserAccounts
            .FirstOrDefaultAsync(ua => ua.Username == userIdClaim.Value);

        if (userAccount == null || !userAccount.DoctorId.HasValue)
        {
            return BadRequest("Invalid doctor account.");
        }

        var doctorId = userAccount.DoctorId.Value;
        var today = DateOnly.FromDateTime(DateTime.Today);

        IQueryable<Appointment> query = _context.Appointments
            .Where(a => a.DoctorId == doctorId)
            .Include(a => a.Patient)
            .Include(a => a.MedicalRecords);

        if (period == "today")
        {
            query = query.Where(a => a.Date == today);
        }
        else if (period == "week")
        {
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
            var endOfWeek = startOfWeek.AddDays(6);
            query = query.Where(a => a.Date >= startOfWeek && a.Date <= endOfWeek);
        }

        var appointments = await query
#pragma warning disable CS8602
            .Select(a => new
            {
                a.AppointmentId,
                a.Date,
                a.Time,
                a.Status,
                Patient = new { a.Patient.PatientId, a.Patient.Name, a.Patient.Phone },
                HasMedicalRecord = a.MedicalRecords.Any()
            })
#pragma warning restore CS8602
            .ToListAsync();

        return Ok(appointments);
    }

    // POST /api/medical/records
    [HttpPost("records")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> CreateMedicalRecord([FromBody] CreateMedicalRecordRequest request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Name);
        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        var userAccount = await _context.UserAccounts
            .FirstOrDefaultAsync(ua => ua.Username == userIdClaim.Value);

        if (userAccount == null || !userAccount.DoctorId.HasValue)
        {
            return BadRequest("Invalid doctor account.");
        }

        // Verify the appointment belongs to this doctor
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.AppointmentId == request.AppointmentId && a.DoctorId == userAccount.DoctorId.Value);

        if (appointment == null)
        {
            return NotFound("Appointment not found or not authorized.");
        }

        // Create MedicalRecord
        var medicalRecord = new MedicalRecord
        {
            Symptoms = request.Symptoms,
            Diagnosis = request.Diagnosis,
            Treatment = request.Treatment,
            CreatedDate = DateTime.UtcNow,
            AppointmentId = request.AppointmentId
        };

        _context.MedicalRecords.Add(medicalRecord);
        await _context.SaveChangesAsync();

        // Create LabResults if provided
        if (request.LabResults != null)
        {
            foreach (var labResult in request.LabResults)
            {
                if (labResult != null)
                {
                    var lab = new LabResult
                    {
                        ResultDetails = labResult.ResultDetails,
                        ResultDate = labResult.ResultDate ?? DateTime.UtcNow,
                        RecordId = medicalRecord.RecordId
                    };
                    _context.LabResults.Add(lab);
                }
            }
            await _context.SaveChangesAsync();
        }

        // Load the created medical record with related data for DTO
        var createdRecord = await _context.MedicalRecords
            .Include(mr => mr.Appointment!)
                .ThenInclude(a => a!.Doctor!)
            .Include(mr => mr.Appointment!)
                .ThenInclude(a => a!.Patient!)
            .Include(mr => mr.Appointment!)
                .ThenInclude(a => a!.AppointmentServices!)
            .Include(mr => mr.Appointment!)
                .ThenInclude(a => a!.Payments!)
            .Include(mr => mr.LabResults!)
            .FirstOrDefaultAsync(mr => mr.RecordId == medicalRecord.RecordId);

        if (createdRecord == null)
        {
            return StatusCode(500, "Failed to retrieve created record");
        }

        // Map to DTO to avoid circular references
        var dto = new MedicalRecordDto
        {
            RecordId = createdRecord.RecordId,
            Symptoms = createdRecord.Symptoms,
            Diagnosis = createdRecord.Diagnosis,
            Treatment = createdRecord.Treatment,
            CreatedDate = createdRecord.CreatedDate,
            AppointmentId = createdRecord.AppointmentId,
            Appointment = createdRecord.Appointment != null ? new AppointmentForRecordDto
            {
                AppointmentId = createdRecord.Appointment.AppointmentId,
                Date = createdRecord.Appointment.Date,
                Time = createdRecord.Appointment.Time,
                Status = createdRecord.Appointment.Status,
                PatientId = createdRecord.Appointment.PatientId ?? 0,
                DoctorId = createdRecord.Appointment.DoctorId ?? 0,
                Doctor = createdRecord.Appointment.Doctor != null ? new DoctorDto
                {
                    DoctorId = createdRecord.Appointment.Doctor.DoctorId,
                    Name = createdRecord.Appointment.Doctor.Name!,
                    Phone = createdRecord.Appointment.Doctor.Phone!,
                    Specialty = createdRecord.Appointment.Doctor.Specialty != null ? new SpecialtyDto
                    {
                        SpecialtyId = createdRecord.Appointment.Doctor.Specialty.SpecialtyId,
                        Name = createdRecord.Appointment.Doctor.Specialty.Name!
                    } : null
                } : null,
                Patient = createdRecord.Appointment.Patient != null ? new PatientDto
                {
                    PatientId = createdRecord.Appointment.Patient.PatientId,
                    Name = createdRecord.Appointment.Patient.Name!,
                    Dob = createdRecord.Appointment.Patient.Dob?.ToString("yyyy-MM-dd") ?? "",
                    Gender = createdRecord.Appointment.Patient.Gender ?? "",
                    Phone = createdRecord.Appointment.Patient.Phone ?? "",
                    Address = createdRecord.Appointment.Patient.Address ?? ""
                } : null
            } : null,
            LabResults = createdRecord.LabResults?.Select(lr => new LabResultForRecordDto
            {
                ResultId = lr.ResultId,
                ResultDetails = lr.ResultDetails,
                ResultDate = lr.ResultDate,
                RecordId = lr.RecordId ?? 0
            }).ToList() ?? new List<LabResultForRecordDto>()
        };

        return CreatedAtAction(nameof(CreateMedicalRecord), new { id = dto.RecordId }, dto);
    }

    // GET /api/medical/records
    [HttpGet("records")]
    [Authorize]
    public async Task<IActionResult> GetMedicalRecords()
    {
        var user = await GetCurrentUser();
        if (user == null) return Unauthorized();

        IQueryable<MedicalRecord> query = _context.MedicalRecords
            .Include(mr => mr.Appointment!)
                .ThenInclude(a => a!.Doctor!)
            .Include(mr => mr.Appointment!)
                .ThenInclude(a => a!.Patient!)
            .Include(mr => mr.LabResults!);

        var records = await query.ToListAsync();

        if (user.Role == "Patient" && user.PatientId.HasValue)
        {
            records = records.Where(mr => mr.Appointment != null && mr.Appointment.PatientId == user.PatientId.Value).ToList();
        }
        else if (user.Role == "Doctor" && user.DoctorId.HasValue)
        {
            records = records.Where(mr => mr.Appointment != null && mr.Appointment.DoctorId == user.DoctorId.Value).ToList();
        }

        var dtos = records.Select(mr => new MedicalRecordDto
            {
                RecordId = mr.RecordId,
                Symptoms = mr.Symptoms,
                Diagnosis = mr.Diagnosis,
                Treatment = mr.Treatment,
                CreatedDate = mr.CreatedDate,
                AppointmentId = mr.AppointmentId,
                Appointment = mr.Appointment != null ? new AppointmentForRecordDto
                {
                    AppointmentId = mr.Appointment.AppointmentId,
                    Date = mr.Appointment.Date,
                    Time = mr.Appointment.Time,
                    Status = mr.Appointment.Status,
                    PatientId = mr.Appointment.PatientId ?? 0,
                    DoctorId = mr.Appointment.DoctorId ?? 0,
                    Doctor = mr.Appointment.Doctor != null ? new DoctorDto
                    {
                        DoctorId = mr.Appointment.Doctor.DoctorId,
                        Name = mr.Appointment.Doctor.Name!,
                        Phone = mr.Appointment.Doctor.Phone!,
                        Specialty = mr.Appointment.Doctor.Specialty != null ? new SpecialtyDto
                        {
                            SpecialtyId = mr.Appointment.Doctor.Specialty.SpecialtyId,
                            Name = mr.Appointment.Doctor.Specialty.Name!
                        } : null
                    } : null,
                    Patient = mr.Appointment.Patient != null ? new PatientDto
                    {
                        PatientId = mr.Appointment.Patient.PatientId,
                        Name = mr.Appointment.Patient.Name!,
                        Dob = mr.Appointment.Patient.Dob?.ToString("yyyy-MM-dd") ?? "",
                        Gender = mr.Appointment.Patient.Gender ?? "",
                        Phone = mr.Appointment.Patient.Phone ?? "",
                        Address = mr.Appointment.Patient.Address ?? ""
                    } : null
                } : null,
                LabResults = mr.LabResults?.Select(lr => new LabResultForRecordDto
                {
                    ResultId = lr.ResultId,
                    ResultDetails = lr.ResultDetails,
                    ResultDate = lr.ResultDate,
                    RecordId = lr.RecordId ?? 0
                }).ToList() ?? new List<LabResultForRecordDto>()
            }).ToList();

        return Ok(dtos);
    }

    [HttpPut("records/{id}")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> PutMedicalRecord(int id, UpdateMedicalRecordDto dto)
    {
        var user = await GetCurrentUser();
        if (user == null) return Unauthorized();

        var record = await _context.MedicalRecords.FindAsync(id);
        if (record == null) return NotFound();

        // Only the doctor who created the record can update it
        var appointment = await _context.Appointments.FindAsync(record.AppointmentId);
        if (appointment == null || appointment.DoctorId != user.DoctorId)
        {
            return Forbid();
        }

        if (!string.IsNullOrEmpty(dto.Symptoms)) record.Symptoms = dto.Symptoms;
        if (!string.IsNullOrEmpty(dto.Diagnosis)) record.Diagnosis = dto.Diagnosis;
        if (!string.IsNullOrEmpty(dto.Treatment)) record.Treatment = dto.Treatment;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!MedicalRecordExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    [HttpDelete("records/{id}")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> DeleteMedicalRecord(int id)
    {
        var user = await GetCurrentUser();
        if (user == null) return Unauthorized();

        var record = await _context.MedicalRecords.FindAsync(id);
        if (record == null) return NotFound();

        // Only the doctor who created the record can delete it
        var appointment = await _context.Appointments.FindAsync(record.AppointmentId);
        if (appointment == null || appointment.DoctorId != user.DoctorId)
        {
            return Forbid();
        }

        _context.MedicalRecords.Remove(record);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool MedicalRecordExists(int id)
    {
        return _context.MedicalRecords.Any(e => e.RecordId == id);
    }

    private async Task<UserAccount?> GetCurrentUser()
    {
        var username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
        if (username == null) return null;
        return await _context.UserAccounts.FirstOrDefaultAsync(u => u.Username == username);
    }
}

public class CreateMedicalRecordRequest
{
    public int AppointmentId { get; set; }
    public string? Symptoms { get; set; }
    public string? Diagnosis { get; set; }
    public string? Treatment { get; set; }
    public List<LabResultRequest>? LabResults { get; set; }
}

public class LabResultRequest
{
    public string? ResultDetails { get; set; }
    public DateTime? ResultDate { get; set; }
}