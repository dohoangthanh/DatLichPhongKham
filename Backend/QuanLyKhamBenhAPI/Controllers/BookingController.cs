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
            .Select(d => new { d.DoctorId, d.Name, d.Phone })
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

        // Check if slot is available
        var existingAppointment = await _context.Appointments
            .AnyAsync(a => a.DoctorId == request.DoctorId && a.Date == request.Date && a.Time == request.Time && a.Status != "Cancelled");

        if (existingAppointment)
        {
            return BadRequest("Slot is already booked.");
        }

        var appointment = new Appointment
        {
            Date = request.Date,
            Time = request.Time,
            Status = "Scheduled",
            PatientId = userAccount.PatientId.Value,
            DoctorId = request.DoctorId
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(CreateAppointment), new { id = appointment.AppointmentId }, appointment);
    }
}

public class CreateAppointmentRequest
{
    public DateOnly Date { get; set; }
    public TimeOnly Time { get; set; }
    public int DoctorId { get; set; }
}