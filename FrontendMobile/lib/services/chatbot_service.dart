import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class ChatbotService {
  Future<Map<String, dynamic>> sendMessage(String token, String message) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/chatbot/chat'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'message': message,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'message': data['message'] ?? 'Không thể trả lời câu hỏi này.',
          'timestamp': data['timestamp'],
        };
      } else if (response.statusCode == 400) {
        throw Exception('Yêu cầu không hợp lệ');
      } else if (response.statusCode == 401) {
        throw Exception('Vui lòng đăng nhập để sử dụng chatbot');
      } else {
        throw Exception('Không thể kết nối đến server');
      }
    } catch (e) {
      throw Exception('Lỗi khi gửi tin nhắn: $e');
    }
  }
  
  // Giữ lại method cũ để tương thích
  Future<String> askQuestion(String token, String question) async {
    final result = await sendMessage(token, question);
    return result['message'];
  }
}
