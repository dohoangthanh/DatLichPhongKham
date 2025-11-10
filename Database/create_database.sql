-- Create Database Script for QuanLyKhamBenh
-- SQL Server Database Creation and Table Setup

-- Create the database
CREATE DATABASE QuanLyKhamBenh;
GO

-- Use the database
USE QuanLyKhamBenh;
GO

-- Create Specialty table
CREATE TABLE Specialty (
    specialtyId INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(255)
);

-- Create Doctor table
CREATE TABLE Doctor (
    doctorId INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20),
    specialtyId INT,
    FOREIGN KEY (specialtyId) REFERENCES Specialty(specialtyId)
);

-- Create Patient table
CREATE TABLE Patient (
    patientId INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    dob DATE,
    gender NVARCHAR(10),
    phone NVARCHAR(20),
    address NVARCHAR(255)
);

-- Create UserAccount table
CREATE TABLE UserAccount (
    userId INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) UNIQUE NOT NULL,
    passwordHash NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL, -- e.g., 'Admin', 'Doctor', 'Patient'
    doctorId INT NULL,
    patientId INT NULL,
    FOREIGN KEY (doctorId) REFERENCES Doctor(doctorId),
    FOREIGN KEY (patientId) REFERENCES Patient(patientId)
);

-- Create WorkShift table
CREATE TABLE WorkShift (
    shiftId INT PRIMARY KEY IDENTITY(1,1),
    date DATE NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    doctorId INT,
    FOREIGN KEY (doctorId) REFERENCES Doctor(doctorId)
);

-- Create Appointment table
CREATE TABLE Appointment (
    appointmentId INT PRIMARY KEY IDENTITY(1,1),
    date DATE NOT NULL,
    time TIME NOT NULL,
    status NVARCHAR(50) NOT NULL, -- e.g., 'Scheduled', 'Completed', 'Cancelled'
    patientId INT,
    doctorId INT,
    FOREIGN KEY (patientId) REFERENCES Patient(patientId),
    FOREIGN KEY (doctorId) REFERENCES Doctor(doctorId)
);

-- Create Service table
CREATE TABLE Service (
    serviceId INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    type NVARCHAR(50) -- e.g., 'Examination', 'Test'
);

-- Create AppointmentService junction table
CREATE TABLE AppointmentService (
    id INT PRIMARY KEY IDENTITY(1,1),
    appointmentId INT,
    serviceId INT,
    FOREIGN KEY (appointmentId) REFERENCES Appointment(appointmentId),
    FOREIGN KEY (serviceId) REFERENCES Service(serviceId)
);

-- Create MedicalRecord table
CREATE TABLE MedicalRecord (
    recordId INT PRIMARY KEY IDENTITY(1,1),
    symptoms NVARCHAR(500),
    diagnosis NVARCHAR(500),
    treatment NVARCHAR(500),
    createdDate DATETIME DEFAULT GETDATE(),
    appointmentId INT,
    FOREIGN KEY (appointmentId) REFERENCES Appointment(appointmentId)
);

-- Create LabResult table
CREATE TABLE LabResult (
    resultId INT PRIMARY KEY IDENTITY(1,1),
    resultDetails NVARCHAR(1000),
    resultDate DATETIME DEFAULT GETDATE(),
    recordId INT,
    FOREIGN KEY (recordId) REFERENCES MedicalRecord(recordId)
);

-- Create Payment table
CREATE TABLE Payment (
    paymentId INT PRIMARY KEY IDENTITY(1,1),
    totalAmount DECIMAL(10,2) NOT NULL,
    paymentMethod NVARCHAR(50), -- e.g., 'Cash', 'Online'
    status NVARCHAR(50) NOT NULL, -- e.g., 'Pending', 'Completed'
    paymentDate DATETIME DEFAULT GETDATE(),
    appointmentId INT,
    FOREIGN KEY (appointmentId) REFERENCES Appointment(appointmentId)
);

-- Create Promotion table
CREATE TABLE Promotion (
    promoId INT PRIMARY KEY IDENTITY(1,1),
    description NVARCHAR(255),
    discountPercent DECIMAL(5,2), -- e.g., 10.00 for 10%
    startDate DATE,
    endDate DATE
);

-- Create PaymentPromotion junction table
CREATE TABLE PaymentPromotion (
    id INT PRIMARY KEY IDENTITY(1,1),
    paymentId INT,
    promoId INT,
    FOREIGN KEY (paymentId) REFERENCES Payment(paymentId),
    FOREIGN KEY (promoId) REFERENCES Promotion(promoId)
);

-- Create LoyaltyPoints table
CREATE TABLE LoyaltyPoints (
    pointsId INT PRIMARY KEY IDENTITY(1,1),
    points INT DEFAULT 0,
    lastUpdated DATETIME DEFAULT GETDATE(),
    patientId INT,
    FOREIGN KEY (patientId) REFERENCES Patient(patientId)
);

-- Create Feedback table
CREATE TABLE Feedback (
    feedbackId INT PRIMARY KEY IDENTITY(1,1),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(500),
    createdDate DATETIME DEFAULT GETDATE(),
    patientId INT,
    doctorId INT,
    FOREIGN KEY (patientId) REFERENCES Patient(patientId),
    FOREIGN KEY (doctorId) REFERENCES Doctor(doctorId)
);

-- Seed Data

-- Insert Admin UserAccount
INSERT INTO UserAccount (username, passwordHash, role) VALUES ('admin', 'hashedpassword', 'Admin');

-- Insert Specialties
INSERT INTO Specialty (name, description) VALUES ('Tim mạch', 'Chuyên khoa tim mạch');
INSERT INTO Specialty (name, description) VALUES ('Da liễu', 'Chuyên khoa da liễu');

-- Insert Doctors (2 for Tim mạch, 1 for Da liễu)
INSERT INTO Doctor (name, phone, specialtyId) VALUES ('Nguyễn Văn A', '0901234567', 1); -- Tim mạch
INSERT INTO Doctor (name, phone, specialtyId) VALUES ('Trần Thị B', '0901234568', 1); -- Tim mạch
INSERT INTO Doctor (name, phone, specialtyId) VALUES ('Lê Văn C', '0901234569', 2); -- Da liễu

-- Insert Services
INSERT INTO Service (name, price, type) VALUES ('Khám tổng quát', 200000.00, 'Examination');
INSERT INTO Service (name, price, type) VALUES ('Xét nghiệm máu', 150000.00, 'Test');
INSERT INTO Service (name, price, type) VALUES ('Siêu âm tim mạch', 300000.00, 'Test');
INSERT INTO Service (name, price, type) VALUES ('Khám da liễu', 250000.00, 'Examination');

GO