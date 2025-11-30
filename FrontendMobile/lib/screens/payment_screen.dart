import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../services/patient_service.dart';
import '../services/auth_service.dart';

class PaymentScreen extends StatefulWidget {
  final int appointmentId;

  const PaymentScreen({
    super.key,
    required this.appointmentId,
  });

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final PatientService _patientService = PatientService();
  Map<String, dynamic>? _paymentInfo;
  bool _isLoading = true;
  String? _error;
  String _selectedMethod = 'Cash';
  bool _isProcessing = false;

  // Promo code states
  String _promoCode = '';
  bool _isValidatingPromo = false;
  int _discountPercent = 0;
  String _promoMessage = '';
  int _loyaltyPoints = 0;

  final List<Map<String, dynamic>> _paymentMethods = [
    {'value': 'Cash', 'label': 'Tiền mặt', 'icon': Icons.money},
    {'value': 'Card', 'label': 'Thẻ tín dụng', 'icon': Icons.credit_card},
    {'value': 'Transfer', 'label': 'Chuyển khoản', 'icon': Icons.account_balance},
    {'value': 'MoMo', 'label': 'Ví MoMo', 'icon': Icons.wallet},
  ];

  @override
  void initState() {
    super.initState();
    _loadPaymentInfo();
  }

  Future<void> _loadPaymentInfo() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final authService = Provider.of<AuthService>(context, listen: false);

      // Load payment info
      final paymentInfo = await _patientService.getPaymentInfo(
        authService.token!,
        widget.appointmentId,
      );

      // Load loyalty points
      final loyaltyPoints = await _patientService.getLoyaltyPoints(authService.token!);

      setState(() {
        _paymentInfo = paymentInfo;
        _loyaltyPoints = loyaltyPoints;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _loadAppointment() async {
    await _loadPaymentInfo();
  }

  Future<void> _validatePromoCode() async {
    if (_promoCode.trim().isEmpty) {
      setState(() => _promoMessage = 'Vui lòng nhập mã khuyến mãi');
      return;
    }

    setState(() {
      _isValidatingPromo = true;
      _promoMessage = '';
    });

    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      final result = await _patientService.validatePromoCode(
        authService.token!,
        _promoCode.trim(),
      );

      setState(() {
        _discountPercent = result['discountPercent'] ?? 0;
        _promoMessage = '✓ Áp dụng thành công! Giảm $_discountPercent%';
      });
    } catch (e) {
      setState(() {
        _promoMessage = '✗ ${e.toString().replaceAll('Exception: ', '')}';
        _discountPercent = 0;
      });
    } finally {
      setState(() => _isValidatingPromo = false);
    }
  }

  double _getFinalAmount() {
    if (_paymentInfo == null) return 0.0;
    final originalAmount = (_paymentInfo!['payment']['totalAmount'] as num).toDouble();
    final discount = originalAmount * (_discountPercent / 100);
    return originalAmount - discount;
  }

  Future<void> _processPayment() async {
    if (_paymentInfo == null) return;

    setState(() => _isProcessing = true);

    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      final finalAmount = _getFinalAmount();

      // Create payment with final amount
      final paymentId = await _patientService.createPayment(
        authService.token!,
        widget.appointmentId,
        _selectedMethod,
        finalAmount, // Send final amount instead of hardcoded
      );

      if (paymentId != null) {
        // Confirm payment
        final confirmSuccess = await _patientService.confirmPayment(
          authService.token!,
          paymentId,
        );

        if (mounted) {
          setState(() => _isProcessing = false);

          if (confirmSuccess) {
            final pointsEarned = (finalAmount / 10000).floor();
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Thanh toán thành công! Bạn đã nhận được $pointsEarned điểm tích lũy.'),
                backgroundColor: Colors.green,
              ),
            );
            await Future.delayed(const Duration(milliseconds: 500));
            if (mounted) {
              Navigator.pop(context, true);
            }
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Xác nhận thanh toán thất bại. Vui lòng thử lại.'),
                backgroundColor: Colors.red,
              ),
            );
          }
        }
      } else {
        if (mounted) {
          setState(() => _isProcessing = false);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Tạo thanh toán thất bại. Vui lòng thử lại.'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isProcessing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
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
        title: const Text(
          'Thanh toán',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF1E88E5)))
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 64, color: Colors.red),
                      const SizedBox(height: 16),
                      Text(_error!, textAlign: TextAlign.center),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: _loadAppointment,
                        child: const Text('Thử lại'),
                      ),
                    ],
                  ),
                )
              : _buildPaymentForm(),
    );
  }

  Widget _buildPaymentForm() {
    if (_paymentInfo == null) return const SizedBox();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildAppointmentSummary(),
          const SizedBox(height: 24),
          _buildLoyaltyPointsDisplay(),
          const SizedBox(height: 24),
          _buildPromoCodeSection(),
          const SizedBox(height: 24),
          _buildPaymentMethodSelector(),
          const SizedBox(height: 24),
          _buildTotalAmount(),
          const SizedBox(height: 32),
          _buildPayButton(),
        ],
      ),
    );
  }

  Widget _buildAppointmentSummary() {
    if (_paymentInfo == null) return const SizedBox();

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Thông tin lịch hẹn',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 16),
          _buildInfoRow(Icons.event, 'Ngày', _formatDate(_paymentInfo!['date'])),
          const SizedBox(height: 12),
          _buildInfoRow(Icons.access_time, 'Giờ', _formatTime(_paymentInfo!['time'])),
          const SizedBox(height: 12),
          _buildInfoRow(Icons.person, 'Bác sĩ', _paymentInfo!['doctor']['name'] ?? 'N/A'),
          const SizedBox(height: 12),
          _buildInfoRow(Icons.local_hospital, 'Chuyên khoa', _paymentInfo!['specialty']['name'] ?? 'N/A'),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 20, color: const Color(0xFF1E88E5)),
        const SizedBox(width: 12),
        Text(
          '$label: ',
          style: TextStyle(fontSize: 15, color: Colors.grey[600]),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
        ),
      ],
    );
  }

  Widget _buildLoyaltyPointsDisplay() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFF8E1), Color(0xFFFFF3C4)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFFD54F), width: 1),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Color(0xFFFFA000),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.star,
              color: Colors.white,
              size: 24,
            ),
          ),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Điểm tích lũy của bạn',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF424242),
                  ),
                ),
                Text(
                  'Nhận 1 điểm cho mỗi 10,000 VNĐ thanh toán',
                  style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFF757575),
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '$_loyaltyPoints',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFFF6F00),
                ),
              ),
              Text(
                'điểm',
                style: TextStyle(
                  fontSize: 12,
                  color: Color(0xFF757575),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPromoCodeSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Mã khuyến mãi',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: TextEditingController(text: _promoCode),
                  onChanged: (value) => setState(() => _promoCode = value.toUpperCase()),
                  decoration: InputDecoration(
                    hintText: 'Nhập mã khuyến mãi',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: _isValidatingPromo || _promoCode.trim().isEmpty ? null : _validatePromoCode,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E88E5),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isValidatingPromo
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Text('Áp dụng'),
              ),
            ],
          ),
          if (_promoMessage.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              _promoMessage,
              style: TextStyle(
                fontSize: 14,
                color: _promoMessage.startsWith('✓') ? Colors.green : Colors.red,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPaymentMethodSelector() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Phương thức thanh toán',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 16),
          ..._paymentMethods.map((method) => _buildPaymentMethodTile(method)),
        ],
      ),
    );
  }

  Widget _buildPaymentMethodTile(Map<String, dynamic> method) {
    final isSelected = _selectedMethod == method['value'];

    return GestureDetector(
      onTap: () => setState(() => _selectedMethod = method['value']),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF1E88E5).withValues(alpha: 0.1) : Colors.grey[50],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF1E88E5) : Colors.grey[300]!,
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Icon(
              method['icon'],
              color: isSelected ? const Color(0xFF1E88E5) : Colors.grey[600],
              size: 24,
            ),
            const SizedBox(width: 16),
            Text(
              method['label'],
              style: TextStyle(
                fontSize: 16,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                color: isSelected ? const Color(0xFF1E88E5) : Colors.black87,
              ),
            ),
            const Spacer(),
            if (isSelected)
              const Icon(Icons.check_circle, color: Color(0xFF1E88E5), size: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildTotalAmount() {
    if (_paymentInfo == null) return const SizedBox();

    final originalAmount = (_paymentInfo!['payment']['totalAmount'] as num).toDouble();
    final discountAmount = originalAmount * (_discountPercent / 100);
    final finalAmount = _getFinalAmount();

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E88E5),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          const Text(
            'Tóm tắt thanh toán',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 16),
          _buildAmountRow('Phí khám ban đầu', originalAmount, false),
          if (_discountPercent > 0) ...[
            const SizedBox(height: 8),
            _buildAmountRow('Giảm giá ($_discountPercent%)', -discountAmount, false),
            const SizedBox(height: 12),
            Container(
              height: 1,
              color: Colors.white.withValues(alpha: 0.3),
            ),
            const SizedBox(height: 12),
          ],
          _buildAmountRow('Tổng cộng', finalAmount, true),
          if (_discountPercent > 0) ...[
            const SizedBox(height: 8),
            Text(
              'Tiết kiệm ${_formatCurrency(discountAmount)}',
              style: const TextStyle(
                fontSize: 12,
                color: Colors.white,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAmountRow(String label, double amount, bool isTotal) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isTotal ? 18 : 14,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
            color: Colors.white,
          ),
        ),
        Text(
          _formatCurrency(amount),
          style: TextStyle(
            fontSize: isTotal ? 20 : 14,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildPayButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _isProcessing ? null : _processPayment,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF1E88E5),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 0,
        ),
        child: _isProcessing
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : const Text(
                'Xác nhận thanh toán',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
      ),
    );
  }

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return dateStr;
    }
  }

  String _formatTime(String timeStr) {
    try {
      // Assuming time is in HH:mm format
      return timeStr;
    } catch (e) {
      return timeStr;
    }
  }

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    return formatter.format(amount);
  }
}
