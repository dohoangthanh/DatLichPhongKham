-- Kiểm tra Doctor có SpecialtyId không
SELECT 
    d.doctorId,
    d.name as doctorName,
    d.specialtyId,
    s.name as specialtyName
FROM Doctor d
LEFT JOIN Specialty s ON d.specialtyId = s.specialtyId;

-- Kiểm tra Appointment với Doctor và Specialty
SELECT TOP 10
    a.appointmentId,
    a.date,
    a.time,
    a.doctorId,
    d.name as doctorName,
    d.specialtyId,
    s.name as specialtyName,
    p.name as patientName
FROM Appointment a
LEFT JOIN Doctor d ON a.doctorId = d.doctorId
LEFT JOIN Specialty s ON d.specialtyId = s.specialtyId
LEFT JOIN Patient p ON a.patientId = p.patientId
ORDER BY a.date DESC, a.time DESC;

-- Nếu Doctor chưa có specialtyId, cập nhật:
-- UPDATE Doctor 
-- SET specialtyId = 1  -- Thay 1 bằng specialtyId phù hợp
-- WHERE doctorId = 1;  -- Thay 1 bằng doctorId cần update
