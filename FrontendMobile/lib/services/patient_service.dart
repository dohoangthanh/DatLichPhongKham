import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/medical_record.dart';
import '../models/appointment.dart';

class PatientService {
  Future<MedicalRecord> getMedicalRecord(
      String token, int appointmentId) async {
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

  Future<List<Appointment>> getAppointments(String token) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/patient/my-appointments'),
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

  Future<int?> createPayment(String token, int appointmentId,
      String paymentMethod, double totalAmount) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/payment/create'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'appointmentId': appointmentId,
          'paymentMethod': paymentMethod,
          'totalAmount': totalAmount,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return data['paymentId'];
      }
      return null;
    } catch (e) {
      throw Exception('Error creating payment: $e');
    }
  }

  Future<bool> confirmPayment(String token, int paymentId) async {
    try {
      final response = await http.put(
        Uri.parse('${ApiConfig.baseUrl}/payment/confirm/$paymentId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      return response.statusCode == 200;
    } catch (e) {
      throw Exception('Error confirming payment: $e');
    }
  }

  Future<bool> hasPayment(String token, int appointmentId) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/payment/check/$appointmentId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['hasPayment'] ?? false;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> hasReview(String token, int appointmentId) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/feedback/check/$appointmentId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['hasReview'] ?? false;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> createFeedback(
      String token, int doctorId, int rating, String comment) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/feedback'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'doctorId': doctorId,
          'rating': rating,
          'comment': comment,
        }),
      );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      throw Exception('Error creating feedback: $e');
    }
  }

  Future<Map<String, dynamic>> getInvoice(
      String token, int appointmentId) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/payment/invoice/$appointmentId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load invoice: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting invoice: $e');
    }
  }

  Future<Map<String, dynamic>> getPaymentInfo(
      String token, int appointmentId) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/booking/appointments/$appointmentId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load payment info: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting payment info: $e');
    }
  }

  Future<Map<String, dynamic>> validatePromoCode(
      String token, String promoCode) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/promotions/validate/$promoCode'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['message'] ?? 'Mã khuyến mãi không hợp lệ');
      }
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('Error validating promo code: $e');
    }
  }

  Future<Map<String, dynamic>> getReview(
      String token, int appointmentId) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/feedback/review/$appointmentId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load review: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting review: $e');
    }
  }

  Future<int> getLoyaltyPoints(String token) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/loyaltypoints/my-points'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['points'] ?? 0;
      } else {
        return 0;
      }
    } catch (e) {
      return 0;
    }
  }

  Future<List<dynamic>> getDoctors(String token) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/doctors'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as List<dynamic>;
      } else {
        throw Exception('Failed to load doctors: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting doctors: $e');
    }
  }

  Future<List<dynamic>> getSpecialties(String token) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/specialties'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as List<dynamic>;
      } else {
        throw Exception('Failed to load specialties: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting specialties: $e');
    }
  }

  Future<List<dynamic>> getServices(String token) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/services'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as List<dynamic>;
      } else {
        throw Exception('Failed to load services: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting services: $e');
    }
  }

  // Profile APIs
  Future<Map<String, dynamic>> getProfile(String token) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/patient/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        throw Exception('Failed to load profile: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting profile: $e');
    }
  }

  Future<bool> updateProfile(
      String token, Map<String, dynamic> profileData) async {
    try {
      final response = await http.put(
        Uri.parse('${ApiConfig.baseUrl}/patient/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(profileData),
      );

      return response.statusCode == 200;
    } catch (e) {
      throw Exception('Error updating profile: $e');
    }
  }

  Future<bool> changePassword(
      String token, String oldPassword, String newPassword) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/auth/change-password'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'oldPassword': oldPassword,
          'newPassword': newPassword,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      throw Exception('Error changing password: $e');
    }
  }
}
