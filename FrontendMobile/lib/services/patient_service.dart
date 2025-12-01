import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/medical_record.dart';

class PatientService {
  Future<MedicalRecord> getMedicalRecord(String token, int appointmentId) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/patient/my-records/$appointmentId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return MedicalRecord.fromJson(data);
      } else if (response.statusCode == 404) {
        throw Exception('Chưa có kết quả khám bệnh');
      } else {
        throw Exception('Failed to load medical record');
      }
    } catch (e) {
      throw Exception('Error fetching medical record: $e');
    }
  }
}
