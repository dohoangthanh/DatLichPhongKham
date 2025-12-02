import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../services/auth_service.dart';
import '../services/patient_service.dart';

class ServicesListScreen extends StatefulWidget {
  const ServicesListScreen({super.key});

  @override
  State<ServicesListScreen> createState() => _ServicesListScreenState();
}

class _ServicesListScreenState extends State<ServicesListScreen> {
  final PatientService _patientService = PatientService();
  List<dynamic> _services = [];
  bool _isLoading = true;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadServices();
  }

  Future<void> _loadServices() async {
    setState(() => _isLoading = true);

    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      if (authService.token != null) {
        final services = await _patientService.getServices(authService.token!);

        if (mounted) {
          setState(() {
            _services = services;
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      print('Error loading services: $e');
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không thể tải danh sách dịch vụ')),
        );
      }
    }
  }

  List<dynamic> get _filteredServices {
    if (_searchQuery.isEmpty) return _services;

    return _services.where((service) {
      final name = service['serviceName']?.toString().toLowerCase() ?? '';
      final description =
          service['description']?.toString().toLowerCase() ?? '';
      final query = _searchQuery.toLowerCase();
      return name.contains(query) || description.contains(query);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: const Color(0xFF64B5F6),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Dịch Vụ Khám Bệnh',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Search Section
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.all(16),
                  child: TextField(
                    onChanged: (value) {
                      setState(() => _searchQuery = value);
                    },
                    decoration: InputDecoration(
                      hintText: 'Tìm kiếm dịch vụ...',
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF64B5F6)),
                      ),
                      filled: true,
                      fillColor: Colors.grey[50],
                    ),
                  ),
                ),
                // Services List
                Expanded(
                  child: _filteredServices.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.search_off,
                                  size: 64, color: Colors.grey[400]),
                              const SizedBox(height: 16),
                              Text(
                                'Không tìm thấy dịch vụ',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _filteredServices.length,
                          itemBuilder: (context, index) {
                            return _buildServiceCard(_filteredServices[index]);
                          },
                        ),
                ),
              ],
            ),
    );
  }

  Widget _buildServiceCard(dynamic service) {
    final serviceId = service['serviceId'];
    final name = service['name'] ?? 'Chưa có tên';
    final description =
        service['description'] ?? service['type'] ?? 'Chưa có mô tả';
    final price = service['price'];
    final imageUrl = service['imageUrl'];
    final formattedPrice = price != null
        ? NumberFormat.currency(locale: 'vi_VN', symbol: '₫').format(price)
        : 'Liên hệ';

    // Build full image URL
    final fullImageUrl = imageUrl != null && imageUrl.toString().isNotEmpty
        ? 'http://10.0.2.2:5129$imageUrl'
        : null;

    // Debug logging
    print('Service: $name');
    print('Original imageUrl: $imageUrl');
    print('Full imageUrl: $fullImageUrl');

    // Determine icon based on service name
    IconData icon = Icons.medical_services;
    Color iconColor = Colors.blue;

    if (name.toLowerCase().contains('tim') ||
        name.toLowerCase().contains('cardio')) {
      icon = Icons.favorite;
      iconColor = Colors.red;
    } else if (name.toLowerCase().contains('não') ||
        name.toLowerCase().contains('thần kinh')) {
      icon = Icons.psychology;
      iconColor = Colors.purple;
    } else if (name.toLowerCase().contains('trẻ em') ||
        name.toLowerCase().contains('nhi')) {
      icon = Icons.child_care;
      iconColor = Colors.orange;
    } else if (name.toLowerCase().contains('xét nghiệm')) {
      icon = Icons.biotech;
      iconColor = Colors.teal;
    } else if (name.toLowerCase().contains('chẩn đoán') ||
        name.toLowerCase().contains('hình ảnh')) {
      icon = Icons.camera_alt;
      iconColor = Colors.indigo;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                // Image or Icon
                Container(
                  width: 70,
                  height: 70,
                  decoration: BoxDecoration(
                    color: fullImageUrl != null
                        ? Colors.grey[200]
                        : iconColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    image: fullImageUrl != null
                        ? DecorationImage(
                            image: NetworkImage(fullImageUrl),
                            fit: BoxFit.cover,
                          )
                        : null,
                  ),
                  child: fullImageUrl == null
                      ? Icon(icon, color: iconColor, size: 32)
                      : null,
                ),
                const SizedBox(width: 16),
                // Service Name and Price
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.green[50],
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          formattedPrice,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.green[700],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (description.isNotEmpty && description != 'Chưa có mô tả') ...[
              const SizedBox(height: 12),
              const Divider(),
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.info_outline, size: 18, color: Colors.grey[600]),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      description,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[700],
                        height: 1.5,
                      ),
                    ),
                  ),
                ],
              ),
            ],
            // Booking Button
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pushNamed(context, '/home');
                  // Will navigate to booking after user returns to home
                  Future.delayed(const Duration(milliseconds: 100), () {
                    Navigator.pushNamed(context, '/specialty-selection');
                  });
                },
                icon: const Icon(Icons.calendar_month, size: 18),
                label: const Text('Đặt Lịch Khám'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF64B5F6),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
