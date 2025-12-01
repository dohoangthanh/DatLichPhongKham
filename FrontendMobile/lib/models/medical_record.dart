class LabResult {
  final int resultId;
  final String resultDetails;
  final DateTime resultDate;

  LabResult({
    required this.resultId,
    required this.resultDetails,
    required this.resultDate,
  });

  factory LabResult.fromJson(Map<String, dynamic> json) {
    return LabResult(
      resultId: json['resultId'] ?? 0,
      resultDetails: json['resultDetails'] ?? '',
      resultDate: DateTime.parse(json['resultDate']),
    );
  }
}

class DoctorInfo {
  final int doctorId;
  final String name;
  final String? specialty;

  DoctorInfo({
    required this.doctorId,
    required this.name,
    this.specialty,
  });

  factory DoctorInfo.fromJson(Map<String, dynamic> json) {
    return DoctorInfo(
      doctorId: json['doctorId'] ?? 0,
      name: json['name'] ?? '',
      specialty: json['specialty'],
    );
  }
}

class AppointmentInfo {
  final int appointmentId;
  final String date;
  final String time;
  final DoctorInfo? doctor;

  AppointmentInfo({
    required this.appointmentId,
    required this.date,
    required this.time,
    this.doctor,
  });

  factory AppointmentInfo.fromJson(Map<String, dynamic> json) {
    return AppointmentInfo(
      appointmentId: json['appointmentId'] ?? 0,
      date: json['date'] ?? '',
      time: json['time'] ?? '',
      doctor: json['doctor'] != null
          ? DoctorInfo.fromJson(json['doctor'])
          : null,
    );
  }
}

class MedicalRecord {
  final int recordId;
  final String symptoms;
  final String diagnosis;
  final String treatment;
  final DateTime createdDate;
  final AppointmentInfo appointment;
  final List<LabResult> labResults;

  MedicalRecord({
    required this.recordId,
    required this.symptoms,
    required this.diagnosis,
    required this.treatment,
    required this.createdDate,
    required this.appointment,
    required this.labResults,
  });

  factory MedicalRecord.fromJson(Map<String, dynamic> json) {
    return MedicalRecord(
      recordId: json['recordId'] ?? 0,
      symptoms: json['symptoms'] ?? '',
      diagnosis: json['diagnosis'] ?? '',
      treatment: json['treatment'] ?? '',
      createdDate: DateTime.parse(json['createdDate']),
      appointment: AppointmentInfo.fromJson(json['appointment']),
      labResults: (json['labResults'] as List<dynamic>?)
              ?.map((item) => LabResult.fromJson(item))
              .toList() ??
          [],
    );
  }
}
