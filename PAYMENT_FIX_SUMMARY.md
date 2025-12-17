# Tóm tắt sửa lỗi Payment - 16/12/2025

## 🐛 Các lỗi đã được sửa

### 1. **Webhook không xác nhận thanh toán tự động**

**Nguyên nhân:** Backend thiếu endpoint GET `/payment/{paymentId}` để frontend polling status

**Giải pháp:**

```csharp
// Thêm endpoint mới trong PaymentController.cs
[HttpGet("{paymentId}")]
public async Task<IActionResult> GetPayment(int paymentId)
{
    // Trả về payment status để frontend polling
    return Ok(new {
        PaymentId = payment.PaymentId,
        Status = payment.Status,  // "Pending" hoặc "Paid"
        TotalAmount = payment.TotalAmount,
        PaymentMethod = payment.PaymentMethod,
        PaymentDate = payment.PaymentDate,
        TransactionId = payment.TransactionId
    });
}
```

**Kết quả:**

- ✅ Frontend polling mỗi 3 giây
- ✅ Khi Casso webhook cập nhật DB → Frontend nhận ngay status "Paid"
- ✅ Tự động hiển thị "Thanh toán thành công!" và đóng modal

---

### 2. **Thiếu thông tin bác sĩ, khoa, dịch vụ trong PaymentModal**

**Nguyên nhân:** Response CreatePayment chỉ trả về thông tin QR, không có thông tin appointment

**Giải pháp Backend:**

```csharp
// Trong CreatePayment, thêm Include để load thông tin liên quan
var appointment = await _context.Appointments
    .Include(a => a.Doctor)
        .ThenInclude(d => d!.Specialty)
    .Include(a => a.AppointmentServices!)
        .ThenInclude(ads => ads.Service)
    .FirstOrDefaultAsync(a => a.AppointmentId == dto.AppointmentId);

// Thêm AppointmentInfo vào response
AppointmentInfo = appointment != null ? new {
    DoctorName = appointment.Doctor?.Name ?? "Unknown",
    SpecialtyName = appointment.Doctor?.Specialty?.Name ?? "Unknown",
    AppointmentDate = appointment.Date.ToString("dd/MM/yyyy"),
    AppointmentTime = appointment.Time.ToString(@"hh\:mm"),
    Services = appointment.AppointmentServices?.Select(ads => new {
        ServiceName = ads.Service?.Name ?? "Unknown",
        Price = ads.Service?.Price ?? 0
    }).ToList()
} : null
```

**Giải pháp Frontend Web:**

```tsx
// PaymentModal.tsx - Thêm box hiển thị thông tin
{
  paymentData.appointmentInfo && (
    <div className="bg-blue-50 p-4 rounded-lg mb-6">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-600">...</svg>
        Thông tin cuộc hẹn
      </h4>
      <div className="space-y-2 text-sm">
        <div>Bác sĩ: {paymentData.appointmentInfo.doctorName}</div>
        <div>Khoa: {paymentData.appointmentInfo.specialtyName}</div>
        <div>
          Thời gian: {appointmentInfo.appointmentTime} -{" "}
          {appointmentInfo.appointmentDate}
        </div>
        {/* Danh sách dịch vụ */}
        {appointmentInfo.services.map((service) => (
          <div>
            • {service.serviceName} - {service.price.toLocaleString()} ₫
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Giải pháp Frontend Mobile:**

```dart
// payment_modal.dart - Tương tự Web
if (_paymentData!['appointmentInfo'] != null)
  Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.blue.shade50,
      borderRadius: BorderRadius.circular(8),
    ),
    child: Column(
      children: [
        Row(children: [
          Icon(Icons.assignment, color: Colors.blue.shade700),
          Text('Thông tin cuộc hẹn'),
        ]),
        // Hiển thị bác sĩ, khoa, dịch vụ...
      ],
    ),
  ),
```

**Kết quả:**

- ✅ Hiển thị tên bác sĩ
- ✅ Hiển thị khoa khám
- ✅ Hiển thị ngày giờ hẹn
- ✅ Hiển thị danh sách dịch vụ với giá (nếu có)

---

## 📊 Luồng hoạt động hoàn chỉnh

```
1. User click "Thanh toán"
   ↓
2. PaymentModal mở, hiển thị form nhập mã giảm giá
   ↓
3. User click "Tạo mã thanh toán"
   ↓
4. Frontend gọi: POST /api/payment/create
   Backend trả về:
   - QR Code URL (VietQR.io)
   - Thông tin ngân hàng
   - ✨ Thông tin cuộc hẹn (bác sĩ, khoa, dịch vụ)
   ↓
5. PaymentModal hiển thị:
   - ✨ Box xanh: Thông tin cuộc hẹn
   - QR Code auto-fill
   - Thông tin ngân hàng
   - Loading: "Đang chờ thanh toán..."
   ↓
6. User quét QR / chuyển khoản
   ↓
7. Casso.vn nhận giao dịch → Gửi webhook
   ↓
8. Backend webhook:
   - Verify checksum
   - Extract payment ID từ "THANHTOAN 123"
   - Cập nhật payment.Status = "Paid"
   ↓
9. ✨ Frontend polling (mỗi 3 giây):
   GET /api/payment/{paymentId}
   ↓
10. Nhận status = "Paid" → Hiển thị success → Auto close → Reload
```

---

## 🔧 Các file đã chỉnh sửa

### Backend:

1. **Controllers/PaymentController.cs**
   - Line ~32: Thêm endpoint `GET {paymentId}`
   - Line ~68: Load Appointment với Include Doctor, Specialty, Services
   - Line ~162: Thêm AppointmentInfo vào response

### Frontend Web:

1. **components/PaymentModal.tsx**
   - Line ~175: Thêm box hiển thị thông tin cuộc hẹn
   - Hiển thị bác sĩ, khoa, thời gian, danh sách dịch vụ

### Frontend Mobile:

1. **lib/screens/payment_modal.dart**
   - Line ~372: Thêm Container hiển thị thông tin cuộc hẹn
   - Tương tự Web, dùng Flutter widgets

---

## ✅ Test đã hoàn thành

- [x] Backend build thành công
- [x] Endpoint GET /payment/{id} hoạt động
- [x] AppointmentInfo trả về đầy đủ
- [x] PaymentModal Web hiển thị thông tin
- [x] PaymentModal Mobile hiển thị thông tin
- [x] QR Code vẫn auto-fill đúng
- [x] Polling status hoạt động
- [x] Auto close modal khi paid

---

## 📱 Hướng dẫn test

### 1. Khởi động Backend:

```bash
cd Backend/QuanLyKhamBenhAPI
dotnet run
# Đang chạy tại http://localhost:5129
```

### 2. Test trên Web:

```bash
cd FrontendWeb
npm run dev
# Truy cập: http://localhost:3000/patient/history
```

**Các bước:**

1. Click "Thanh toán" trên appointment chưa thanh toán
2. Kiểm tra modal hiển thị:
   - ✅ Box xanh: Thông tin bác sĩ, khoa, dịch vụ
   - ✅ QR Code VietQR
   - ✅ Thông tin ngân hàng
3. Chuyển khoản 2.000 VND với nội dung "THANHTOAN {paymentId}"
4. Đợi 5-10 giây
5. Modal tự động hiển thị "Thanh toán thành công!" và đóng

### 3. Test trên Mobile:

```bash
cd FrontendMobile
flutter run
```

Tương tự Web

---

## 🔍 Debug nếu có lỗi

### Webhook không trigger:

```bash
# Kiểm tra log backend
# Terminal đang chạy dotnet run sẽ hiển thị:
info: QuanLyKhamBenhAPI.Controllers.PaymentController[0]
      Received Casso webhook: {...}
      Payment 51 marked as Paid
```

### Frontend không cập nhật:

```javascript
// Mở DevTools > Network
// Tìm request: GET /api/payment/51
// Response phải có: { "status": "Paid" }
```

### Thông tin cuộc hẹn không hiển thị:

```javascript
// Console log paymentData
console.log(paymentData.appointmentInfo);
// Phải có: { doctorName, specialtyName, appointmentDate, appointmentTime, services }
```

---

## 🎉 Kết luận

**Đã sửa xong 2 vấn đề chính:**

1. ✅ **Webhook xác nhận tự động** - Frontend polling status, tự động cập nhật khi thanh toán thành công
2. ✅ **Hiển thị đầy đủ thông tin** - PaymentModal hiển thị bác sĩ, khoa, dịch vụ kèm QR code

**Tất cả platform đã được cập nhật:**

- Backend: Thêm endpoint + appointmentInfo
- Web: PaymentModal với box thông tin
- Mobile: PaymentModal với box thông tin

**Sẵn sàng test production!** 🚀
