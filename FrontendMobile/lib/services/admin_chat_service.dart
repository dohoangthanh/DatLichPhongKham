import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:signalr_netcore/signalr_client.dart';
import '../config/api_config.dart';

class AdminChatService {
  HubConnection? _hubConnection;
  Function(Map<String, dynamic>)? onMessageReceived;

  // Gửi tin nhắn đến admin qua REST API
  Future<Map<String, dynamic>> sendMessageToAdmin(
      String token, String message) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/chat/send'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'message': message,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to send message: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error sending message: $e');
    }
  }

  // Lấy lịch sử tin nhắn với admin
  Future<List<Map<String, dynamic>>> getMessages(String token) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/chat/messages'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      } else {
        throw Exception('Failed to load messages');
      }
    } catch (e) {
      throw Exception('Error loading messages: $e');
    }
  }

  // Kết nối SignalR để nhận tin nhắn realtime
  Future<void> connectSignalR(String token) async {
    try {
      _hubConnection = HubConnectionBuilder()
          .withUrl('${ApiConfig.chatHubUrl}?access_token=$token')
          .withAutomaticReconnect()
          .build();

      // Lắng nghe tin nhắn từ admin
      _hubConnection!.on('ReceiveMessageFromAdmin', (arguments) {
        if (arguments != null && arguments.isNotEmpty) {
          final data = arguments[0] as Map<String, dynamic>?;
          if (data != null && onMessageReceived != null) {
            print('📩 Received message from admin: $data');
            onMessageReceived!(data);
          }
        }
      });

      _hubConnection!.onclose(({Exception? error}) {
        print(
            '❌ SignalR disconnected: ${error?.toString() ?? "connection closed"}');
      });

      _hubConnection!.onreconnecting(({Exception? error}) {
        print('🔄 SignalR reconnecting: ${error?.toString() ?? ""}');
      });

      _hubConnection!.onreconnected(({String? connectionId}) {
        print('✅ SignalR reconnected: ${connectionId ?? ""}');
      });

      await _hubConnection!.start();
      print('✅ SignalR connected successfully');
    } catch (e) {
      print('❌ SignalR connection error: $e');
      throw Exception('Failed to connect SignalR: $e');
    }
  }

  // Gửi tin nhắn qua SignalR (optional, để realtime ngay lập tức)
  Future<void> sendViaSignalR(String message) async {
    if (_hubConnection?.state == HubConnectionState.Connected) {
      try {
        await _hubConnection!.invoke('SendMessageToAdmin', args: [message]);
        print('✅ Message sent via SignalR');
      } catch (e) {
        print('⚠️ Failed to send via SignalR: $e');
      }
    }
  }

  // Ngắt kết nối SignalR
  Future<void> disconnect() async {
    if (_hubConnection != null) {
      await _hubConnection!.stop();
      _hubConnection = null;
      print('🔌 SignalR disconnected');
    }
  }

  bool get isConnected => _hubConnection?.state == HubConnectionState.Connected;
}
