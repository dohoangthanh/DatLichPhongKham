import 'package:flutter/material.dart';

class TestResultsScreen extends StatefulWidget {
  final int appointmentId;

  const TestResultsScreen({
    super.key,
    required this.appointmentId,
  });

  @override
  State<TestResultsScreen> createState() => _TestResultsScreenState();
}

class _TestResultsScreenState extends State<TestResultsScreen> {
  Map<String, dynamic>? _testResults;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadTestResults();
  }

  Future<void> _loadTestResults() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // TODO: Call API to get test results
      // final results = await _patientService.getTestResults(authService.token!, widget.appointmentId);
      
      // Mock data for now
      await Future.delayed(const Duration(seconds: 1));
      
      if (mounted) {
        setState(() {
          _testResults = {
            'appointmentId': widget.appointmentId,
            'date': '2024-12-01',
            'doctorName': 'Dr. Nguyen Van A',
            'diagnosis': 'Viêm họng cấp',
            'tests': [
              {
                'name': 'Xét nghiệm máu tổng quát',
                'results': [
                  {'parameter': 'Hồng cầu', 'value': '5.2', 'unit': 'triệu/mm³', 'normal': '4.5-5.5', 'status': 'normal'},
                  {'parameter': 'Bạch cầu', 'value': '8.5', 'unit': 'nghìn/mm³', 'normal': '4.0-10.0', 'status': 'normal'},
                  {'parameter': 'Tiểu cầu', 'value': '250', 'unit': 'nghìn/mm³', 'normal': '150-400', 'status': 'normal'},
                ],
              },
              {
                'name': 'Xét nghiệm sinh hóa',
                'results': [
                  {'parameter': 'Glucose', 'value': '5.5', 'unit': 'mmol/L', 'normal': '3.9-6.1', 'status': 'normal'},
                  {'parameter': 'Cholesterol', 'value': '5.8', 'unit': 'mmol/L', 'normal': '<5.2', 'status': 'high'},
                ],
              },
            ],
            'notes': 'Kết quả xét nghiệm trong giới hạn bình thường. Cholesterol hơi cao, cần kiểm soát chế độ ăn.',
            'prescription': 'Paracetamol 500mg, 3 lần/ngày sau ăn',
          };
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'normal':
        return Colors.green;
      case 'high':
      case 'low':
        return Colors.orange;
      case 'critical':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'normal':
        return 'Bình thường';
      case 'high':
        return 'Cao';
      case 'low':
        return 'Thấp';
      case 'critical':
        return 'Nguy hiểm';
      default:
        return status;
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
          'Kết quả xét nghiệm',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.download, color: Colors.white),
            onPressed: () {
              // TODO: Implement download functionality
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Tải xuống kết quả...'),
                ),
              );
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF1E88E5)),
            )
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
                        onPressed: _loadTestResults,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1E88E5),
                        ),
                        child: const Text('Thử lại'),
                      ),
                    ],
                  ),
                )
              : _buildContent(),
    );
  }

  Widget _buildContent() {
    if (_testResults == null) return const SizedBox();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildInfoCard(),
          const SizedBox(height: 20),
          _buildDiagnosisCard(),
          const SizedBox(height: 20),
          _buildTestResultsSection(),
          const SizedBox(height: 20),
          if (_testResults!['notes'] != null) _buildNotesCard(),
          const SizedBox(height: 20),
          if (_testResults!['prescription'] != null) _buildPrescriptionCard(),
        ],
      ),
    );
  }

  Widget _buildInfoCard() {
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
            'Thông tin khám',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 12),
          _buildInfoRow(Icons.medical_services, 'Mã lịch hẹn', '#${_testResults!['appointmentId']}'),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.calendar_today, 'Ngày khám', _testResults!['date']),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.person, 'Bác sĩ', _testResults!['doctorName']),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 18, color: const Color(0xFF1E88E5)),
        const SizedBox(width: 12),
        Text(
          '$label: ',
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey[600],
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: Colors.black87,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDiagnosisCard() {
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
          const Row(
            children: [
              Icon(Icons.assignment, color: Color(0xFF1E88E5)),
              SizedBox(width: 8),
              Text(
                'Chẩn đoán',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _testResults!['diagnosis'],
            style: const TextStyle(
              fontSize: 15,
              color: Colors.black87,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTestResultsSection() {
    final tests = _testResults!['tests'] as List;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Kết quả xét nghiệm',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 12),
        ...tests.map((test) => Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: _buildTestCard(test),
        )),
      ],
    );
  }

  Widget _buildTestCard(Map<String, dynamic> test) {
    final results = test['results'] as List;
    
    return Container(
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
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E88E5).withValues(alpha: 0.1),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.science, color: Color(0xFF1E88E5)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    test['name'],
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1E88E5),
                    ),
                  ),
                ),
              ],
            ),
          ),
          ...results.map((result) => _buildResultRow(result)),
        ],
      ),
    );
  }

  Widget _buildResultRow(Map<String, dynamic> result) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Colors.grey[200]!),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Text(
              result['parameter'],
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Colors.black87,
              ),
            ),
          ),
          Expanded(
            child: Text(
              '${result['value']} ${result['unit']}',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: _getStatusColor(result['status']),
              ),
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  result['normal'],
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 2),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: _getStatusColor(result['status']).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _getStatusText(result['status']),
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: _getStatusColor(result['status']),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotesCard() {
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
          const Row(
            children: [
              Icon(Icons.note, color: Color(0xFF1E88E5)),
              SizedBox(width: 8),
              Text(
                'Ghi chú của bác sĩ',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _testResults!['notes'],
            style: const TextStyle(
              fontSize: 14,
              color: Colors.black87,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPrescriptionCard() {
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
          const Row(
            children: [
              Icon(Icons.medication, color: Color(0xFF1E88E5)),
              SizedBox(width: 8),
              Text(
                'Đơn thuốc',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _testResults!['prescription'],
            style: const TextStyle(
              fontSize: 14,
              color: Colors.black87,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
