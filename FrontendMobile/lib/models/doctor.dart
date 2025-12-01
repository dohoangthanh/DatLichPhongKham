class Doctor {
  final int doctorId;
  final String name;
  final String phone;
  final String? imageUrl;
  final Specialty? specialty;

  Doctor({
    required this.doctorId,
    required this.name,
    required this.phone,
    this.imageUrl,
    this.specialty,
  });

  factory Doctor.fromJson(Map<String, dynamic> json) {
    return Doctor(
      doctorId: json['doctorId'] ?? 0,
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      imageUrl: json['imageUrl'],
      specialty: json['specialty'] != null
          ? Specialty.fromJson(json['specialty'])
          : null,
    );
  }
}

class Specialty {
  final int specialtyId;
  final String name;

  Specialty({
    required this.specialtyId,
    required this.name,
  });

  factory Specialty.fromJson(Map<String, dynamic> json) {
    return Specialty(
      specialtyId: json['specialtyId'] ?? 0,
      name: json['name'] ?? '',
    );
  }
}
