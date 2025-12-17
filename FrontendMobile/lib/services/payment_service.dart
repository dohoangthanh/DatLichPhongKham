import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class PaymentService {
  static const String baseUrl = 'http://10.0.2.2:5129/api'; // Android emulator
  // Dùng http://localhost:5129/api cho iOS simulator

  final SharedPreferences prefs;

  PaymentService(this.prefs);

  Future<String?> _getToken() async {
    return prefs.getString('token');
  }

  Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  /// Tạo thanh toán mới
  Future<Map<String, dynamic>> createPayment({
    required int appointmentId,
    required double totalAmount,
    String paymentMethod = 'bank_transfer',
    String? promoCode,
  }) async {
    final headers = await _getHeaders();
    final body = jsonEncode({
      'appointmentId': appointmentId,
      'totalAmount': totalAmount,
      'paymentMethod': paymentMethod,
      if (promoCode != null && promoCode.isNotEmpty) 'promoCode': promoCode,
    });

    final response = await http.post(
      Uri.parse('$baseUrl/payment/create'),
      headers: headers,
      body: body,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Failed to create payment');
    }
  }

  /// Kiểm tra trạng thái thanh toán
  Future<Map<String, dynamic>> getPaymentStatus(int paymentId) async {
    final headers = await _getHeaders();

    final response = await http.get(
      Uri.parse('$baseUrl/payment/$paymentId'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to fetch payment status');
    }
  }

  /// Lấy hóa đơn
  Future<Map<String, dynamic>> getInvoice(int appointmentId) async {
    final headers = await _getHeaders();

    final response = await http.get(
      Uri.parse('$baseUrl/payment/invoice/$appointmentId'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to fetch invoice');
    }
  }

  /// Xác nhận thanh toán (admin only)
  Future<void> confirmPayment(int paymentId, {double? finalAmount}) async {
    final headers = await _getHeaders();
    final body = jsonEncode({
      if (finalAmount != null) 'finalAmount': finalAmount,
    });

    final response = await http.put(
      Uri.parse('$baseUrl/payment/confirm/$paymentId'),
      headers: headers,
      body: body,
    );

    if (response.statusCode != 200) {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Failed to confirm payment');
    }
  }
}
