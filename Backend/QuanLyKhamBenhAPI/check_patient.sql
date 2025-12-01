-- Kiểm tra UserAccount có PatientId không
SELECT 
    ua.userId,
    ua.username, 
    ua.role,
    ua.patientId,
    p.name as patientName
FROM UserAccount ua
LEFT JOIN Patient p ON ua.patientId = p.patientId
WHERE ua.role = 'Patient';

-- Kiểm tra Doctor có tồn tại không
SELECT doctorId, name, specialtyId FROM Doctor;

-- Kiểm tra Specialty
SELECT specialtyId, name FROM Specialty;
