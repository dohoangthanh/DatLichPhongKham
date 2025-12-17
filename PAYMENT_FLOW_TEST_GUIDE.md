# Hướng dẫn Test Flow Thanh toán Hoàn chỉnh

## 📋 FLOW THANH TOÁN MỚI

### Web (Next.js)

```
User vào /patient/payment/[appointmentId]
  ↓
Hiển thị thông tin lịch hẹn + Loyalty Points
  ↓
[Tùy chọn] Nhập mã giảm giá → Click "Áp dụng"
  → API validate promo code
  → Hiển thị % giảm giá
  → Reset createdPaymentId (để tạo payment mới)
  ↓
Click "Thanh toán bằng Chuyển khoản"
  → Gọi API POST /api/payment/create
    {
      appointmentId: 123,
      totalAmount: finalAmount (sau giảm giá),
      paymentMethod: "bank_transfer",
      promoCode: "GIAM10" (nếu có)
    }
  → Nhận response: {paymentId, qrCodeUrl, transferContent, ...}
  → Lưu paymentId vào state
  → Mở PaymentModal
  ↓
PaymentModal hiển thị:
  - QR Code (quét bằng app ngân hàng)
  - Thông tin chuyển khoản (STK, số tiền, nội dung)
  - Copy button cho STK và nội dung
  - Auto-refresh status mỗi 3 giây
  ↓
User chuyển khoản:
  - Ngân hàng: MB Bank
  - STK: 0977135812
  - Số tiền: CHÍNH XÁC số tiền trong payment
  - Nội dung: THANHTOAN {paymentId}
  ↓
Casso nhận webhook từ ngân hàng (5-10 giây)
  ↓
Casso gọi API /api/payment/casso-webhook
  → Backend verify checksum
  → Tìm payment theo nội dung "THANHTOAN {id}"
  → Kiểm tra số tiền khớp
  → Cập nhật Status = "Paid"
  ↓
Modal auto-refresh phát hiện Status = "Paid"
  → Hiển thị "Thanh toán thành công!"
  → Tự động đóng và redirect về /patient/history
```

### Mobile (Flutter)

```
User vào PaymentScreen(appointmentId: 123)
  ↓
Load payment info + loyalty points
  ↓
[Tùy chọn] Nhập mã giảm giá → Click "Áp dụng"
  → API validate promo code
  → Hiển thị % giảm giá
  → Reset _createdPaymentId
  ↓
Click "Thanh toán bằng Chuyển khoản"
  → Gọi PaymentService.createPayment()
  → Nhận paymentData
  → Mở PaymentModal dialog
  ↓
PaymentModal hiển thị:
  - QR Code Flutter (QrImageView)
  - Thông tin chuyển khoản
  - Copy button
  - Auto-polling status mỗi 3 giây
  ↓
User chuyển khoản (giống Web)
  ↓
Casso webhook → Backend update Status = "Paid"
  ↓
Modal polling phát hiện → Hiển thị success → Đóng dialog
  → Navigator.pop(context, true)
```

---

## 🧪 TEST CASES

### Test Case 1: Thanh toán không mã giảm giá

1. ✅ Vào trang thanh toán
2. ✅ Xem số tiền gốc: 270,000 VND
3. ✅ Click "Thanh toán bằng Chuyển khoản"
4. ✅ Modal hiển thị QR code + thông tin
5. ✅ Chuyển khoản đúng số tiền + nội dung
6. ✅ Đợi 5-10 giây
7. ✅ Modal tự động đóng, hiển thị "Thanh toán thành công"
8. ✅ Redirect về history
9. ✅ Kiểm tra database: Status = "Paid", TransactionId có giá trị

### Test Case 2: Thanh toán với mã giảm giá

1. ✅ Nhập mã "GIAM10"
2. ✅ Click "Áp dụng"
3. ✅ Hiển thị "Giảm 10%" → Số tiền: 243,000 VND
4. ✅ Click "Thanh toán bằng Chuyển khoản"
5. ✅ API tạo payment với totalAmount = 243,000
6. ✅ Modal hiển thị số tiền 243,000 VND
7. ✅ Chuyển khoản 243,000 VND (ĐÚNG số tiền sau giảm)
8. ✅ Webhook nhận được → Match payment
9. ✅ Status = "Paid"
10. ✅ Nhận điểm tích lũy: 243,000 / 10,000 = 24 điểm

### Test Case 3: Thay đổi mã giảm giá

1. ✅ Nhập mã "GIAM10" → Áp dụng → 243,000 VND
2. ✅ Chưa thanh toán
3. ✅ Xóa mã, nhập "GIAM20" → Áp dụng → 216,000 VND
4. ✅ createdPaymentId bị reset
5. ✅ Click "Thanh toán" → Tạo payment MỚI với 216,000 VND
6. ✅ Chuyển khoản 216,000 VND
7. ✅ Webhook match payment mới
8. ✅ Nhận 21 điểm

### Test Case 4: Số tiền không khớp

1. ✅ Tạo payment: 270,000 VND
2. ✅ Chuyển khoản SAI: 250,000 VND
3. ✅ Webhook nhận được
4. ❌ Backend check số tiền không khớp
5. ❌ Không update Status
6. ✅ Modal vẫn "Đang chờ thanh toán..."
7. ✅ User phải chuyển lại đúng 270,000 VND

### Test Case 5: Nội dung chuyển khoản sai

1. ✅ Tạo payment ID = 123
2. ✅ Nội dung yêu cầu: "THANHTOAN 123"
3. ✅ User chuyển khoản nội dung: "TT 123" (SAI)
4. ✅ Webhook nhận được
5. ❌ Backend không extract được PaymentId
6. ❌ Không update Status
7. ✅ User phải chuyển lại đúng nội dung

---

## 🔍 ĐIỂM KIỂM TRA CHI TIẾT

### Backend API `/api/payment/create`

```csharp
// Input
{
  "appointmentId": 123,
  "totalAmount": 243000, // Sau giảm giá
  "paymentMethod": "bank_transfer",
  "promoCode": "GIAM10"
}

// Logic
1. ✅ Validate appointment exists
2. ✅ Apply promo code (nếu có)
3. ✅ Tạo Payment với totalAmount = 243000
4. ✅ Gọi VietQRService.GenerateVietQR(243000, "THANHTOAN {paymentId}")
5. ✅ Lưu QrCodeUrl, TransferContent vào Payment
6. ✅ Return response

// Output
{
  "paymentId": 456,
  "totalAmount": 243000,
  "qrCodeUrl": "00020101021238570...",
  "transferContent": "THANHTOAN 456",
  "bankName": "MB Bank",
  "accountNumber": "0977135812",
  "accountName": "DO HOANG THANH"
}
```

### Backend Webhook `/api/payment/casso-webhook`

```csharp
// Casso gửi
POST /api/payment/casso-webhook
X-Secure-Token: {checksum}
{
  "data": [
    {
      "tid": "FT25123012345678",
      "amount": 243000,
      "description": "THANHTOAN 456",
      "when": "2025-12-16T10:30:00"
    }
  ]
}

// Backend xử lý
1. ✅ Verify checksum HMAC-SHA256
2. ✅ Extract PaymentId từ "THANHTOAN 456" → 456
3. ✅ Tìm Payment ID = 456
4. ✅ Check amount: 243000 == Payment.TotalAmount
5. ✅ Update:
   - Status = "Paid"
   - PaymentDate = "2025-12-16T10:30:00"
   - TransactionId = "FT25123012345678"
6. ✅ Return {"error": 0, "message": "success"}
```

### Frontend PaymentModal (Web)

```typescript
useEffect(() => {
  // Polling mỗi 3 giây
  const interval = setInterval(async () => {
    const status = await paymentApi.getStatus(paymentId);
    setPaymentStatus(status.status);

    if (status.status === "Paid") {
      clearInterval(interval);
      // Hiển thị success 2 giây
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    }
  }, 3000);

  return () => clearInterval(interval);
}, [paymentData]);
```

### Mobile PaymentModal (Flutter)

```dart
void _startStatusPolling() {
  _statusCheckTimer = Timer.periodic(Duration(seconds: 3), (timer) async {
    final status = await widget.paymentService.getPaymentStatus(paymentId);
    setState(() => _paymentStatus = status['status']);

    if (_paymentStatus == 'Paid') {
      timer.cancel();
      // Hiển thị SnackBar
      ScaffoldMessenger.of(context).showSnackBar(...);
      // Đợi 2 giây
      Future.delayed(Duration(seconds: 2), () {
        Navigator.of(context).pop(true);
      });
    }
  });
}
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Số tiền PHẢI khớp chính xác

- ❌ SAI: Tạo payment 270,000 VND → Chuyển 250,000 VND
- ✅ ĐÚNG: Tạo payment 270,000 VND → Chuyển 270,000 VND
- Cho phép sai lệch < 1 đồng (do làm tròn)

### 2. Nội dung chuyển khoản PHẢI đúng format

- ✅ ĐÚNG: `THANHTOAN 123`
- ✅ ĐÚNG: `thanhtoan 123` (case-insensitive)
- ❌ SAI: `TT 123`
- ❌ SAI: `THANH TOAN 123` (dấu cách thừa)

### 3. Thay đổi promo code → Tạo lại payment

```typescript
// Web
setCreatedPaymentId(null); // Reset khi validate promo

// Mobile
_createdPaymentId = null; // Reset khi validate promo
```

### 4. Backend phải đang chạy

```bash
cd d:\DatLichPhongKham\Backend\QuanLyKhamBenhAPI
dotnet run
```

### 5. Ngrok phải đang chạy

```bash
ngrok http 5000
```

### 6. Webhook URL phải đúng trên Casso Dashboard

```
https://[your-ngrok-url]/api/payment/casso-webhook
```

---

## 📊 KẾT QUẢ MONG ĐỢI

### Database Payment Table

```sql
PaymentId: 456
AppointmentId: 123
TotalAmount: 243000.00
PaymentMethod: Bank Transfer
Status: Paid
PaymentDate: 2025-12-16 10:30:00
QrCodeUrl: 00020101021238570...
TransferContent: THANHTOAN 456
TransactionId: FT25123012345678
```

### User nhận được

- ✅ Hóa đơn thanh toán
- ✅ Điểm tích lũy: 24 điểm (243,000 / 10,000)
- ✅ Email xác nhận (nếu có)
- ✅ Appointment Status = "Completed"

---

## 🚀 CÁCH TEST NHANH

### Test Web

```bash
# 1. Start backend
cd Backend/QuanLyKhamBenhAPI
dotnet run

# 2. Start ngrok
ngrok http 5000

# 3. Start frontend
cd FrontendWeb
npm run dev

# 4. Mở browser
http://localhost:3000/patient/payment/1

# 5. Chuyển khoản test
MB Bank: 0977135812
Số tiền: 1,000 VND (test)
Nội dung: THANHTOAN {paymentId}
```

### Test Mobile

```bash
# 1. Start backend + ngrok (giống Web)

# 2. Update baseUrl trong payment_service.dart
# Android Emulator: http://10.0.2.2:5129/api
# iOS Simulator: http://localhost:5129/api

# 3. Run app
cd FrontendMobile
flutter run

# 4. Navigate đến PaymentScreen
# 5. Chuyển khoản test (giống Web)
```

---

**Tất cả đã được tích hợp! Test theo flow trên để kiểm tra!** ✅
