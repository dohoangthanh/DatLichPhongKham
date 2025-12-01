-- Kiểm tra user account và patient
SELECT 
    ua.userId,
    ua.username,
    ua.role,
    ua.patientId,
    p.name as patientName,
    p.phone,
    p.address
FROM UserAccount ua
LEFT JOIN Patient p ON ua.patientId = p.patientId
WHERE ua.username = 'dohoangthanh';  -- Thay bằng username của bạn

-- Kiểm tra tất cả patient accounts
SELECT 
    ua.userId,
    ua.username,
    ua.role,
    ua.patientId,
    p.name as patientName
FROM UserAccount ua
LEFT JOIN Patient p ON ua.patientId = p.patientId
WHERE ua.role = 'Patient';

-- Fix nếu thiếu patient record
-- UPDATE UserAccount 
-- SET patientId = (SELECT patientId FROM Patient WHERE name = 'Tên của bạn')
-- WHERE username = 'dohoangthanh' AND patientId IS NULL;
