import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';
import '../services/payment_service.dart';

class PaymentModal extends StatefulWidget {
  final int appointmentId;
  final double totalAmount;
  final PaymentService paymentService;

  const PaymentModal({
    Key? key,
    required this.appointmentId,
    required this.totalAmount,
    required this.paymentService,
  }) : super(key: key);

  @override
  State<PaymentModal> createState() => _PaymentModalState();
}

class _PaymentModalState extends State<PaymentModal> {
  bool _loading = false;
  Map<String, dynamic>? _paymentData;
  String _paymentStatus = 'Pending';
  final _promoCodeController = TextEditingController();
  Timer? _statusCheckTimer;

  @override
  void dispose() {
    _statusCheckTimer?.cancel();
    _promoCodeController.dispose();
    super.dispose();
  }

  void _startStatusPolling() {
    _statusCheckTimer =
        Timer.periodic(const Duration(seconds: 3), (timer) async {
      try {
        final status = await widget.paymentService
            .getPaymentStatus(_paymentData!['paymentId']);
        setState(() {
          _paymentStatus = status['status'];
        });

        if (_paymentStatus == 'Paid') {
          timer.cancel();
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Thanh toán thành công!'),
                backgroundColor: Colors.green,
              ),
            );
            Future.delayed(const Duration(seconds: 2), () {
              if (mounted) Navigator.of(context).pop(true);
            });
          }
        }
      } catch (e) {
        // Ignore errors during polling
      }
    });
  }

  Future<void> _createPayment() async {
    setState(() => _loading = true);
    try {
      final result = await widget.paymentService.createPayment(
        appointmentId: widget.appointmentId,
        totalAmount: widget.totalAmount,
        promoCode: _promoCodeController.text.trim().isNotEmpty
            ? _promoCodeController.text.trim()
            : null,
      );

      setState(() {
        _paymentData = result;
      });

      _startStatusPolling();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() => _loading = false);
    }
  }

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Đã sao chép $label')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        constraints: const BoxConstraints(maxHeight: 700),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Thanh toán',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),

            // Body
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: _paymentData == null
                    ? _buildPaymentForm()
                    : _buildPaymentDetails(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Số tiền thanh toán',
          style: TextStyle(fontSize: 14, color: Colors.grey),
        ),
        const SizedBox(height: 8),
        Text(
          '${widget.totalAmount.toStringAsFixed(0)} ₫',
          style: const TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: Colors.blue,
          ),
        ),
        const SizedBox(height: 24),
        TextField(
          controller: _promoCodeController,
          decoration: const InputDecoration(
            labelText: 'Mã giảm giá (tùy chọn)',
            border: OutlineInputBorder(),
            prefixIcon: Icon(Icons.discount),
          ),
        ),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _loading ? null : _createPayment,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: _loading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text(
                    'Tạo mã thanh toán',
                    style: TextStyle(fontSize: 16),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildPaymentDetails() {
    if (_paymentStatus == 'Paid') {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.green.shade100,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.check,
              color: Colors.green,
              size: 48,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Thanh toán thành công!',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.green,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Đang chuyển hướng...',
            style: TextStyle(color: Colors.grey),
          ),
        ],
      );
    }

    return Column(
      children: [
        // Warning banner
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.yellow.shade50,
            border: Border(
              left: BorderSide(color: Colors.yellow.shade700, width: 4),
            ),
          ),
          child: const Row(
            children: [
              Icon(Icons.warning_amber, color: Colors.orange),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Quét mã QR hoặc chuyển khoản theo thông tin bên dưới.\nThanh toán sẽ tự động xác nhận.',
                  style: TextStyle(fontSize: 12),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // QR Code
        if (_paymentData!['qrCodeUrl'] != null)
          Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300, width: 4),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Image.network(
                  _paymentData!['qrCodeUrl'],
                  width: 250,
                  height: 250,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      width: 250,
                      height: 250,
                      alignment: Alignment.center,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.error_outline,
                              size: 48, color: Colors.red.shade300),
                          const SizedBox(height: 8),
                          const Text('Không thể tải mã QR',
                              style: TextStyle(color: Colors.grey)),
                        ],
                      ),
                    );
                  },
                  loadingBuilder: (context, child, loadingProgress) {
                    if (loadingProgress == null) return child;
                    return Container(
                      width: 250,
                      height: 250,
                      alignment: Alignment.center,
                      child: CircularProgressIndicator(
                        value: loadingProgress.expectedTotalBytes != null
                            ? loadingProgress.cumulativeBytesLoaded /
                                loadingProgress.expectedTotalBytes!
                            : null,
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.check_circle,
                            color: Colors.green.shade700, size: 16),
                        const SizedBox(width: 8),
                        const Text(
                          'QR Code tự động điền đầy đủ thông tin',
                          style: TextStyle(
                              fontSize: 13, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Quét bằng: MB Bank, Sacombank, MoMo, VietQR...',
                      style:
                          TextStyle(fontSize: 11, color: Colors.grey.shade600),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),

        // Thông tin cuộc hẹn
        if (_paymentData!['appointmentInfo'] != null)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.assignment,
                        color: Colors.blue.shade700, size: 20),
                    const SizedBox(width: 8),
                    const Text(
                      'Thông tin cuộc hẹn',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _buildInfoRow(
                    'Bác sĩ:', _paymentData!['appointmentInfo']['doctorName']),
                const SizedBox(height: 8),
                _buildInfoRow(
                    'Khoa:', _paymentData!['appointmentInfo']['specialtyName']),
                const SizedBox(height: 8),
                _buildInfoRow(
                  'Thời gian:',
                  '${_paymentData!['appointmentInfo']['appointmentTime']} - ${_paymentData!['appointmentInfo']['appointmentDate']}',
                ),
                if (_paymentData!['appointmentInfo']['services'] != null &&
                    (_paymentData!['appointmentInfo']['services'] as List)
                        .isNotEmpty) ...[
                  const SizedBox(height: 12),
                  const Divider(),
                  const SizedBox(height: 8),
                  const Text(
                    'Dịch vụ:',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  ...(_paymentData!['appointmentInfo']['services'] as List)
                      .map((service) {
                    return Padding(
                      padding: const EdgeInsets.only(left: 16, bottom: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              '• ${service['serviceName']}',
                              style: const TextStyle(fontSize: 13),
                            ),
                          ),
                          Text(
                            '${service['price'].toStringAsFixed(0)} ₫',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ],
              ],
            ),
          ),
        const SizedBox(height: 16),

        // Payment Info
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            children: [
              _buildInfoRow('Ngân hàng:', _paymentData!['bankName']),
              const Divider(),
              _buildInfoRow('Số tài khoản:', _paymentData!['accountNumber'],
                  copyable: true),
              const Divider(),
              _buildInfoRow('Chủ tài khoản:', _paymentData!['accountName']),
              const Divider(),
              _buildInfoRow(
                'Số tiền:',
                '${_paymentData!['totalAmount'].toStringAsFixed(0)} ₫',
                highlight: true,
              ),
              const Divider(),
              _buildInfoRow('Nội dung CK:', _paymentData!['transferContent'],
                  copyable: true, highlight: true),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Loading indicator
        const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
            SizedBox(width: 12),
            Text('Đang chờ thanh toán...',
                style: TextStyle(color: Colors.grey)),
          ],
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value,
      {bool copyable = false, bool highlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: Colors.grey),
          ),
          Row(
            children: [
              Text(
                value,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: highlight ? Colors.blue : Colors.black,
                  fontSize: highlight ? 16 : 14,
                ),
              ),
              if (copyable) ...[
                const SizedBox(width: 8),
                InkWell(
                  onTap: () => _copyToClipboard(value, label),
                  child: const Icon(Icons.copy, size: 18, color: Colors.blue),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
