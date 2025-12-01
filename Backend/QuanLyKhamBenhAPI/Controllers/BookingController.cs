using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;
using System.Security.Claims;

namespace QuanLyKhamBenhAPI.Controllers;

[ApiController]
[Route("api/booking")]
public class BookingController : ControllerBase
{
    private readonly QuanLyKhamBenhContext _context;

    public BookingController(QuanLyKhamBenhContext context)
    {
        _context = context;
    }

    // GET /api/booking/specialties
    [HttpGet("specialties")]
    public async Task<IActionResult> GetSpecialties()
    {
        var specialties = await _context.Specialties
            .Select(s => new { s.SpecialtyId, s.Name, s.Description })
            .ToListAsync();
        return Ok(specialties);
    }

    // GET /api/booking/doctors/{specialtyId}
    [HttpGet("doctors/{specialtyId}")]
    public async Task<IActionResult> GetDoctorsBySpecialty(int specialtyId)
    {
        var doctors = await _context.Doctors
            .Where(d => d.SpecialtyId == specialtyId)
            .Select(d => new { d.DoctorId, d.Name, d.Phone, d.ImageUrl })
            .ToListAsync();
        return Ok(doctors);
    }

    // GET /api/booking/slots/{doctorId}/{date}
    [HttpGet("slots/{doctorId}/{date}")]
    public async Task<IActionResult> GetAvailableSlots(int doctorId, string date)
    {
        if (!DateOnly.TryParse(date, out var parsedDate))
        {
            return BadRequest("Invalid date format. Use YYYY-MM-DD.");
        }

        // Get work shifts for the doctor on the given date
        var workShifts = await _context.WorkShifts
            .Where(ws => ws.DoctorId == doctorId && ws.Date == parsedDate)
            .ToListAsync();

        // Get booked appointments for the doctor on the given date
        var bookedAppointments = await _context.Appointments
            .Where(a => a.DoctorId == doctorId && a.Date == parsedDate && a.Status != "Cancelled")
            .Select(a => a.Time)
            .ToListAsync();

        // Generate available slots
        var availableSlots = new List<TimeOnly>();
        foreach (var shift in workShifts)
        {
            var currentTime = shift.StartTime;
            while (currentTime < shift.EndTime)
            {
                if (!bookedAppointments.Contains(currentTime))
                {
                    availableSlots.Add(currentTime);
                }
                currentTime = currentTime.AddMinutes(30); // Assuming 30-minute slots
            }
        }

        return Ok(availableSlots);
    }

    // POST /api/booking/appointments
    [HttpPost("appointments")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentRequest request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Name);
        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        var userAccount = await _context.UserAccounts
            .FirstOrDefaultAsync(ua => ua.Username == userIdClaim.Value);

        if (userAccount == null || !userAccount.PatientId.HasValue)
        {
            return BadRequest("Invalid patient account.");
        }

        // Parse date and time
        if (!DateOnly.TryParse(request.Date, out var parsedDate))
        {
            return BadRequest("Invalid date format. Use YYYY-MM-DD.");
        }

        if (!TimeOnly.TryParse(request.Time, out var parsedTime))
        {
            return BadRequest("Invalid time format. Use HH:mm:ss or HH:mm.");
        }

        // Check if slot is available
        var existingAppointment = await _context.Appointments
            .AnyAsync(a => a.DoctorId == request.DoctorId && a.Date == parsedDate && a.Time == parsedTime && a.Status != "Cancelled");

        if (existingAppointment)
        {
            return BadRequest("Slot is already booked.");
        }

        var appointment = new Appointment
        {
            Date = parsedDate,
            Time = parsedTime,
            Status = "Scheduled",
            PatientId = userAccount.PatientId.Value,
            DoctorId = request.DoctorId
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        // Create payment record
        var payment = new Payment
        {
            TotalAmount = 300000, // Default consultation fee
            PaymentMethod = "Pending",
            Status = "Pending",
            PaymentDate = DateTime.Now,
            AppointmentId = appointment.AppointmentId
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            appointmentId = appointment.AppointmentId,
            message = "Appointment created successfully"
        });
    }

    // GET /api/booking/my-appointments
    [HttpGet("my-appointments")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> GetMyAppointments()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Name);
        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        var userAccount = await _context.UserAccounts
            .FirstOrDefaultAsync(ua => ua.Username == userIdClaim.Value);

        if (userAccount == null || !userAccount.PatientId.HasValue)
        {
            return BadRequest("Invalid patient account.");
        }

        var appointments = await _context.Appointments
            .Where(a => a.PatientId == userAccount.PatientId.Value)
            .Include(a => a.Doctor)
            .ThenInclude(d => d!.Specialty)
            .OrderByDescending(a => a.Date)
            .ThenByDescending(a => a.Time)
            .Select(a => new
            {
                a.AppointmentId,
                a.Date,
                a.Time,
                a.Status,
                Doctor = a.Doctor != null ? new
                {
                    a.Doctor.DoctorId,
                    a.Doctor.Name,
                    a.Doctor.Phone,
                    a.Doctor.ImageUrl
                } : null,
                Specialty = a.Doctor != null && a.Doctor.Specialty != null ? new
                {
                    a.Doctor.Specialty.SpecialtyId,
                    a.Doctor.Specialty.Name
                } : null
            })
            .ToListAsync();

        return Ok(appointments);
    }

    // GET /api/booking/appointments/{appointmentId}
    [HttpGet("appointments/{appointmentId}")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> GetAppointmentById(int appointmentId)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Name);
        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        var userAccount = await _context.UserAccounts
            .FirstOrDefaultAsync(ua => ua.Username == userIdClaim.Value);

        if (userAccount == null || !userAccount.PatientId.HasValue)
        {
            return BadRequest("Invalid patient account.");
        }

        var appointment = await _context.Appointments
            .Where(a => a.AppointmentId == appointmentId && a.PatientId == userAccount.PatientId.Value)
            .Include(a => a.Doctor)
            .ThenInclude(d => d!.Specialty)
            .Include(a => a.Payments)
            .Select(a => new
            {
                a.AppointmentId,
                a.Date,
                a.Time,
                a.Status,
                Doctor = a.Doctor != null ? new
                {
                    a.Doctor.DoctorId,
                    a.Doctor.Name,
                    a.Doctor.Phone
                } : null,
                Specialty = a.Doctor != null && a.Doctor.Specialty != null ? new
                {
                    a.Doctor.Specialty.SpecialtyId,
                    a.Doctor.Specialty.Name
                } : null,
                Payment = a.Payments.FirstOrDefault() != null ? new
                {
                    PaymentId = a.Payments.First().PaymentId,
                    TotalAmount = a.Payments.First().TotalAmount,
                    PaymentMethod = a.Payments.First().PaymentMethod,
                    Status = a.Payments.First().Status
                } : null
            })
            .FirstOrDefaultAsync();

        if (appointment == null)
        {
            return NotFound("Appointment not found");
        }

        return Ok(appointment);
    }
}

public class CreateAppointmentRequest
{
    public required string Date { get; set; }
    public required string Time { get; set; }
    public required int DoctorId { get; set; }
}