class ChatMessage {
  final int? messageId;
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final String? senderRole; // 'Patient', 'Admin', 'AI'
  final String? senderName;

  ChatMessage({
    this.messageId,
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.senderRole,
    this.senderName,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      messageId: json['messageId'],
      text: json['message'],
      isUser: json['senderRole'] == 'Patient',
      timestamp: DateTime.parse(json['sentAt']),
      senderRole: json['senderRole'],
      senderName: json['adminName'],
    );
  }
}
