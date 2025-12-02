-- Script xóa dữ liệu khách hàng, lịch khám, đánh giá
-- GIỮ LẠI: Bác sĩ, Chuyên khoa, Dịch vụ, Tài khoản bác sĩ và admin

-- 1. Backup trước khi xóa (tùy chọn)
-- BACKUP DATABASE [YourDatabaseName] TO DISK = 'D:\Backup\backup.bak'

BEGIN TRANSACTION;

BEGIN TRY
    -- Xóa theo thứ tự để tránh lỗi Foreign Key

    -- 1. Xóa Feedback (đánh giá)
    PRINT 'Xóa Feedback...';
    DELETE FROM Feedback;
    PRINT 'Đã xóa ' + CAST(@@ROWCOUNT AS VARCHAR) + ' Feedback';

    -- 2. Xóa AppointmentService (dịch vụ trong lịch khám)
    PRINT 'Xóa AppointmentService...';
    DELETE FROM AppointmentService;
    PRINT 'Đã xóa ' + CAST(@@ROWCOUNT AS VARCHAR) + ' AppointmentService';

    -- 3. Xóa Payment (thanh toán)
    PRINT 'Xóa Payment...';
    DELETE FROM Payment;
    PRINT 'Đã xóa ' + CAST(@@ROWCOUNT AS VARCHAR) + ' Payment';

    -- 4. Xóa LabResult (kết quả xét nghiệm)
    IF OBJECT_ID('LabResult', 'U') IS NOT NULL
    BEGIN
        PRINT 'Xóa LabResult...';
        DELETE FROM LabResult;
        PRINT 'Đã xóa ' + CAST(@@ROWCOUNT AS VARCHAR) + ' LabResult';
    END

    -- 5. Xóa MedicalRecord (hồ sơ bệnh án)
    PRINT 'Xóa MedicalRecord...';
    DELETE FROM MedicalRecord;
    PRINT 'Đã xóa ' + CAST(@@ROWCOUNT AS VARCHAR) + ' MedicalRecord';

    -- 6. Xóa TestResult (kết quả xét nghiệm - nếu có bảng riêng)
    IF OBJECT_ID('TestResult', 'U') IS NOT NULL
    BEGIN
        PRINT 'Xóa TestResult...';
        DELETE FROM TestResult;
        PRINT 'Đã xóa ' + CAST(@@ROWCOUNT AS VARCHAR) + ' TestResult';
    END

    -- 7. Xóa Appointment (lịch khám)
    PRINT 'Xóa Appointment...';
    DELETE FROM Appointment;
    PRINT 'Đã xóa ' + CAST(@@ROWCOUNT AS VARCHAR) + ' Appointment';

    -- 8. Xóa WorkShift (ca làm việc của bác sĩ)
    PRINT 'Xóa WorkShift...';
    DELETE FROM WorkShift;
    PRINT 'Đã xóa ' + CAST(@@ROWCOUNT AS VARCHAR) + ' WorkShift';

    -- 9. Xóa ChatMessages (tin nhắn chat giữa patient và admin)
    IF OBJECT_ID('ChatMessages', 'U') IS NOT NULL
    BEGIN
        PRINT 'Xóa ChatMessages...';
        DELETE FROM ChatMessages WHERE PatientId IN (SELECT UserId FROM UserAccount WHERE Role = 'Patient');
        PRINT 'Đã xóa ' + CAST(@@ROWCOUNT AS VARCHAR) + ' ChatMessages';
    END

    -- 10. Xóa UserAccount của Patient (GIỮ LẠI Admin và Doctor)
    PRINT 'Xóa UserAccount của Patient...';
    DELETE FROM UserAccount WHERE role = 'Patient';
    PRINT 'Đã xóa ' + CAST(@@ROWCOUNT AS VARCHAR) + ' UserAccount Patient';

    -- 11. Xóa LoyaltyPoints (điểm tích lũy)
    IF OBJECT_ID('LoyaltyPoints', 'U') IS NOT NULL
    BEGIN
        PRINT 'Xóa LoyaltyPoints...';
        DELETE FROM LoyaltyPoints;
        PRINT 'Đã xóa ' + CAST(@@ROWCOUNT AS VARCHAR) + ' LoyaltyPoints';
    END

    -- 12. Xóa Patient
    PRINT 'Xóa Patient...';
    DELETE FROM Patient;
    PRINT 'Đã xóa ' + CAST(@@ROWCOUNT AS VARCHAR) + ' Patient';

    -- Reset Identity (auto-increment) nếu muốn
    -- DBCC CHECKIDENT ('Patient', RESEED, 0);
    -- DBCC CHECKIDENT ('Appointment', RESEED, 0);
    -- DBCC CHECKIDENT ('Payment', RESEED, 0);
    -- DBCC CHECKIDENT ('Feedback', RESEED, 0);

    COMMIT TRANSACTION;
    PRINT '===================================';
    PRINT 'XÓA DỮ LIỆU THÀNH CÔNG!';
    PRINT '===================================';
    
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '===================================';
    PRINT 'LỖI: ' + ERROR_MESSAGE();
    PRINT 'Đã ROLLBACK, không có dữ liệu nào bị xóa.';
    PRINT '===================================';
END CATCH;

-- Kiểm tra dữ liệu còn lại
PRINT '';
PRINT '=== KIỂM TRA DỮ LIỆU CÒN LẠI ===';
SELECT 'Patient' AS TableName, COUNT(*) AS Count FROM Patient;
SELECT 'UserAccount Patient' AS TableName, COUNT(*) AS Count FROM UserAccount WHERE role = 'Patient';
SELECT 'Appointment' AS TableName, COUNT(*) AS Count FROM Appointment;
SELECT 'Payment' AS TableName, COUNT(*) AS Count FROM Payment;
SELECT 'Feedback' AS TableName, COUNT(*) AS Count FROM Feedback;
SELECT 'WorkShift' AS TableName, COUNT(*) AS Count FROM WorkShift;
IF OBJECT_ID('ChatMessages', 'U') IS NOT NULL
    SELECT 'ChatMessages' AS TableName, COUNT(*) AS Count FROM ChatMessages;
PRINT '';
PRINT '=== DỮ LIỆU GIỮ LẠI ===';
SELECT 'Doctor' AS TableName, COUNT(*) AS Count FROM Doctor;
SELECT 'Specialty' AS TableName, COUNT(*) AS Count FROM Specialty;
SELECT 'Service' AS TableName, COUNT(*) AS Count FROM Service;
SELECT 'UserAccount Admin' AS TableName, COUNT(*) AS Count FROM UserAccount WHERE role = 'Admin';
SELECT 'UserAccount Doctor' AS TableName, COUNT(*) AS Count FROM UserAccount WHERE role = 'Doctor';
