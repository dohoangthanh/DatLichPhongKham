-- Tạo Admin Account cho Production
-- Password: Admin@123

-- Xóa admin cũ nếu có
DELETE FROM UserAccount WHERE Username = 'admin';

-- Tạo admin mới
INSERT INTO UserAccount (Username, PasswordHash, Role, PatientId, DoctorId)
VALUES (
    'admin',
    'AQAAAAIAAYagAAAAEDqGXNWhzJt7T2XJzOWp7LKK7xKL8qKdCEPkrXVU7B/2PqxQhH4k2hJzKQVqHQCpGw==',
    'Admin',
    NULL,
    NULL
);

-- Kiểm tra
SELECT * FROM UserAccount WHERE Username = 'admin';
