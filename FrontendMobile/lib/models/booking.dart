class Specialty {
  final int specialtyId;
  final String name;
  final String? description;

  Specialty({
    required this.specialtyId,
    required this.name,
    this.description,
  });

  factory Specialty.fromJson(Map<String, dynamic> json) {
    return Specialty(
      specialtyId: json['specialtyId'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'],
    );
  }
}

class BookingDoctor {
  final int doctorId;
  final String name;
  final String phone;

  BookingDoctor({
    required this.doctorId,
    required this.name,
    required this.phone,
  });

  factory BookingDoctor.fromJson(Map<String, dynamic> json) {
    return BookingDoctor(
      doctorId: json['doctorId'] ?? 0,
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
    );
  }
}

class Payment {
  final int paymentId;
  final String status;
  final double totalAmount;

  Payment({
    required this.paymentId,
    required this.status,
    required this.totalAmount,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      paymentId: json['paymentId'] ?? 0,
      status: json['status'] ?? '',
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
    );
  }
}

class Appointment {
  final int appointmentId;
  final String date;
  final String time;
  final String status;
  final int patientId;
  final int doctorId;
  final BookingDoctor? doctor;
  final Specialty? specialty;
  final Payment? payment;
  final bool? hasFeedback;

  Appointment({
    required this.appointmentId,
    required this.date,
    required this.time,
    required this.status,
    required this.patientId,
    required this.doctorId,
    this.doctor,
    this.specialty,
    this.payment,
    this.hasFeedback,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      appointmentId: json['appointmentId'] ?? 0,
      date: json['date'] ?? '',
      time: json['time'] ?? '',
      status: json['status'] ?? '',
      patientId: json['patientId'] ?? 0,
      doctorId: json['doctorId'] ?? (json['doctor'] != null ? json['doctor']['doctorId'] : 0),
      doctor: json['doctor'] != null 
          ? BookingDoctor.fromJson(json['doctor'])
          : null,
      specialty: json['specialty'] != null 
          ? Specialty.fromJson(json['specialty'])
          : null,
      payment: json['payment'] != null 
          ? Payment.fromJson(json['payment'])
          : null,
      hasFeedback: json['hasFeedback'] as bool?,
    );
  }
}
