import 'doctor.dart';

class Appointment {
  final int appointmentId;
  final String date;
  final String time;
  final String status;
  final String? reason;
  final Doctor? doctor;

  Appointment({
    required this.appointmentId,
    required this.date,
    required this.time,
    required this.status,
    this.reason,
    this.doctor,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      appointmentId: json['appointmentId'],
      date: json['date'],
      time: json['time'],
      status: json['status'],
      reason: json['reason'],
      doctor: json['doctor'] != null ? Doctor.fromJson(json['doctor']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'appointmentId': appointmentId,
      'date': date,
      'time': time,
      'status': status,
      'reason': reason,
      'doctor': doctor != null ? {
        'doctorId': doctor!.doctorId,
        'name': doctor!.name,
        'phone': doctor!.phone,
      } : null,
    };
  }
}
