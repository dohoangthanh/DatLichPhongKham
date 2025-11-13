import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/booking.dart';

class BookingService {
  Future<List<Specialty>> getSpecialties() async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/booking/specialties'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Specialty.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load specialties');
      }
    } catch (e) {
      throw Exception('Error fetching specialties: $e');
    }
  }

  Future<List<BookingDoctor>> getDoctorsBySpecialty(int specialtyId) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/booking/doctors/$specialtyId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => BookingDoctor.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load doctors');
      }
    } catch (e) {
      throw Exception('Error fetching doctors: $e');
    }
  }

  Future<List<String>> getAvailableSlots(int doctorId, String date) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/booking/slots/$doctorId/$date'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((slot) => slot.toString()).toList();
      } else {
        throw Exception('Failed to load slots');
      }
    } catch (e) {
      throw Exception('Error fetching slots: $e');
    }
  }

  Future<bool> createAppointment({
    required String token,
    required int doctorId,
    required String date,
    required String time,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/booking/appointments'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'doctorId': doctorId,
          'date': date,
          'time': time,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      throw Exception('Error creating appointment: $e');
    }
  }

  Future<List<Appointment>> getMyAppointments(String token) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/booking/my-appointments'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Appointment.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load appointments');
      }
    } catch (e) {
      throw Exception('Error fetching appointments: $e');
    }
  }
}
