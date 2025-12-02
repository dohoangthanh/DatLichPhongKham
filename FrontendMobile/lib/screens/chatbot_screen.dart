import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/chat_message.dart';
import '../services/chatbot_service.dart';
import '../services/admin_chat_service.dart';
import '../services/auth_service.dart';

enum ChatMode { ai, admin }

class ChatbotScreen extends StatefulWidget {
  const ChatbotScreen({super.key});

  @override
  State<ChatbotScreen> createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends State<ChatbotScreen> {
  final ChatbotService _chatbotService = ChatbotService();
  final AdminChatService _adminChatService = AdminChatService();
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  bool _isLoading = false;
  ChatMode _chatMode = ChatMode.ai;
  bool _isConnected = false;
  final Set<String> _messageIds = {}; // Track message IDs to prevent duplicates

  @override
  void initState() {
    super.initState();
    _addWelcomeMessage();
    _setupAdminChat();
  }

  @override
  void dispose() {
    _adminChatService.disconnect();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _addWelcomeMessage() {
    setState(() {
      _messages.add(
        ChatMessage(
          text: _chatMode == ChatMode.ai
              ? 'Xin chào! Tôi là trợ lý ảo của phòng khám. Tôi có thể giúp gì cho bạn?'
              : 'Xin chào! Bạn đang kết nối với đội ngũ hỗ trợ của phòng khám. Chúng tôi sẽ trả lời trong thời gian sớm nhất.',
          isUser: false,
          timestamp: DateTime.now(),
          senderRole: _chatMode == ChatMode.ai ? 'AI' : 'System',
        ),
      );
    });
  }

  Future<void> _setupAdminChat() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    if (authService.token != null) {
      try {
        // Setup SignalR listener
        _adminChatService.onMessageReceived = (data) {
          if (_chatMode == ChatMode.admin && mounted) {
            // Prevent duplicate messages
            final messageId = data['messageId']?.toString();
            final message = data['message']?.toString();
            final timestamp = DateTime.parse(data['timestamp']);

            // Check if message already exists (by ID or by content+timestamp within 2 seconds)
            if (messageId != null && _messageIds.contains(messageId)) {
              print('⚠️ Duplicate message detected (ID: $messageId), skipping');
              return;
            }

            // Check for duplicate by message content and timestamp
            bool isDuplicate = _messages.any((m) {
              return !m.isUser &&
                  m.text == message &&
                  timestamp.difference(m.timestamp).abs().inSeconds < 2;
            });

            if (isDuplicate) {
              print('⚠️ Duplicate message detected (content match), skipping');
              return;
            }

            setState(() {
              if (messageId != null) _messageIds.add(messageId);
              _messages.add(
                ChatMessage(
                  messageId: messageId != null ? int.tryParse(messageId) : null,
                  text: message ?? '',
                  isUser: false,
                  timestamp: timestamp,
                  senderRole: 'Admin',
                  senderName: data['adminName'],
                ),
              );
            });
            _scrollToBottom();
          }
        };

        // Connect SignalR
        await _adminChatService.connectSignalR(authService.token!);
        if (mounted) {
          setState(() => _isConnected = true);
        }
      } catch (e) {
        print('Failed to setup admin chat: $e');
      }
    }
  }

  Future<void> _switchMode(ChatMode mode) async {
    if (_chatMode == mode) return;

    setState(() {
      _chatMode = mode;
      _messages.clear();
      _messageIds.clear(); // Clear message ID tracking
      _isLoading = true;
    });

    if (mode == ChatMode.admin) {
      // Load admin messages
      await _loadAdminMessages();
    } else {
      // AI mode
      _addWelcomeMessage();
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadAdminMessages() async {
    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      if (authService.token == null) return;

      final messages = await _adminChatService.getMessages(authService.token!);

      if (mounted) {
        setState(() {
          if (messages.isEmpty) {
            _addWelcomeMessage();
          } else {
            _messages.addAll(messages.map((m) => ChatMessage.fromJson(m)));
          }
          _isLoading = false;
        });
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
      print('Error loading admin messages: $e');
    }
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add(
        ChatMessage(
          text: text,
          isUser: true,
          timestamp: DateTime.now(),
          senderRole: 'Patient',
        ),
      );
      _isLoading = true;
      _messageController.clear();
    });

    _scrollToBottom();

    try {
      final authService = Provider.of<AuthService>(context, listen: false);

      if (_chatMode == ChatMode.ai) {
        // AI Chatbot
        final result =
            await _chatbotService.sendMessage(authService.token!, text);

        if (mounted) {
          setState(() {
            _messages.add(
              ChatMessage(
                text: result['message'],
                isUser: false,
                timestamp: DateTime.now(),
                senderRole: 'AI',
              ),
            );
            _isLoading = false;
          });
          _scrollToBottom();
        }
      } else {
        // Admin Chat
        await _adminChatService.sendMessageToAdmin(authService.token!, text);

        // Gửi qua SignalR để realtime ngay
        if (_isConnected) {
          await _adminChatService.sendViaSignalR(text);
        }

        if (mounted) {
          setState(() => _isLoading = false);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.add(
            ChatMessage(
              text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
              isUser: false,
              timestamp: DateTime.now(),
              senderRole: _chatMode == ChatMode.ai ? 'AI' : 'System',
            ),
          );
          _isLoading = false;
        });
        _scrollToBottom();
      }
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E88E5),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _chatMode == ChatMode.ai ? 'Trợ Lý Ảo' : 'Chat với Quản Trị Viên',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (_chatMode == ChatMode.admin)
              Text(
                _isConnected ? '🟢 Đang kết nối' : '🔴 Chưa kết nối',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                ),
              ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Mode Switching Tabs
          Container(
            color: Colors.white,
            child: Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => _switchMode(ChatMode.ai),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        border: Border(
                          bottom: BorderSide(
                            color: _chatMode == ChatMode.ai
                                ? const Color(0xFF1E88E5)
                                : Colors.transparent,
                            width: 3,
                          ),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.smart_toy,
                            size: 18,
                            color: Color(0xFF1E88E5),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'Trợ lý AI',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: _chatMode == ChatMode.ai
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                              color: _chatMode == ChatMode.ai
                                  ? const Color(0xFF1E88E5)
                                  : Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: InkWell(
                    onTap: () => _switchMode(ChatMode.admin),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        border: Border(
                          bottom: BorderSide(
                            color: _chatMode == ChatMode.admin
                                ? const Color(0xFF1E88E5)
                                : Colors.transparent,
                            width: 3,
                          ),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.support_agent,
                            size: 18,
                            color: Color(0xFF1E88E5),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'Chat Admin',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: _chatMode == ChatMode.admin
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                              color: _chatMode == ChatMode.admin
                                  ? const Color(0xFF1E88E5)
                                  : Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                return _buildMessageBubble(_messages[index]);
              },
            ),
          ),
          if (_isLoading)
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Row(
                children: [
                  const SizedBox(width: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        SizedBox(
                          width: 12,
                          height: 12,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Colors.grey[600]!,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Đang trả lời...',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          _buildMessageInput(),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    final senderLabel = message.senderRole == 'Admin'
        ? (message.senderName ?? 'Admin')
        : message.senderRole == 'AI'
            ? 'AI Assistant'
            : 'Assistant';

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment:
            message.isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          if (!message.isUser)
            Padding(
              padding: const EdgeInsets.only(bottom: 4, left: 4),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    message.senderRole == 'Admin'
                        ? Icons.person
                        : Icons.smart_toy,
                    size: 14,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    senderLabel,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.75,
            ),
            padding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
            decoration: BoxDecoration(
              color:
                  message.isUser ? const Color(0xFF1E88E5) : Colors.grey[200],
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(20),
                topRight: const Radius.circular(20),
                bottomLeft:
                    message.isUser ? const Radius.circular(20) : Radius.zero,
                bottomRight:
                    message.isUser ? Radius.zero : const Radius.circular(20),
              ),
            ),
            child: Text(
              message.text,
              style: TextStyle(
                color: message.isUser ? Colors.white : Colors.black87,
                fontSize: 15,
                height: 1.4,
              ),
            ),
          ),
          if (message.isUser)
            Padding(
              padding: const EdgeInsets.only(top: 4, right: 4),
              child: Text(
                'You',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(24),
                ),
                child: TextField(
                  controller: _messageController,
                  decoration: const InputDecoration(
                    hintText: 'Type a message...',
                    hintStyle: TextStyle(color: Colors.grey),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 12,
                    ),
                  ),
                  maxLines: null,
                  textCapitalization: TextCapitalization.sentences,
                  onSubmitted: (_) => _sendMessage(),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Container(
              decoration: const BoxDecoration(
                color: Color(0xFF1E88E5),
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: const Icon(Icons.send, color: Colors.white, size: 20),
                onPressed: _sendMessage,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
