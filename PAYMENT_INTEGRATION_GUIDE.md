# Hướng dẫn sử dụng Thanh toán Chuyển khoản

## ✅ ĐÃ HOÀN THÀNH

### Backend

- ✅ Xóa toàn bộ ZaloPay (Service, Controller, Config)
- ✅ Chỉ giữ lại Bank Transfer với Casso webhook
- ✅ API `/api/payment/create` hỗ trợ `paymentMethod: "bank_transfer"`
- ✅ API `/api/payment/casso-webhook` tự động xác nhận thanh toán

### Frontend Web (Next.js)

- ✅ Tạo `PaymentModal.tsx` component
- ✅ Tích hợp QR code hiển thị
- ✅ Auto-refresh trạng thái thanh toán mỗi 3 giây
- ✅ Copy thông tin chuyển khoản dễ dàng

### Frontend Mobile (Flutter)

- ✅ Tạo `payment_service.dart`
- ✅ Tạo `payment_modal.dart` với QR Flutter
- ✅ Thêm `qr_flutter: ^4.1.0` vào pubspec.yaml

---

## 📱 SỬ DỤNG TRÊN WEB

### 1. Import component

```typescript
import PaymentModal from "@/components/PaymentModal";
```

### 2. Sử dụng trong component

```typescript
const [showPayment, setShowPayment] = useState(false)

// Hiển thị modal thanh toán
<PaymentModal
  isOpen={showPayment}
  onClose={() => setShowPayment(false)}
  appointmentId={123}
  totalAmount={270000}
/>

// Kích hoạt từ button
<button onClick={() => setShowPayment(true)}>
  Thanh toán
</button>
```

### 3. Flow thanh toán

1. User nhấn "Tạo mã thanh toán"
2. Hiển thị QR code + thông tin chuyển khoản
3. User quét QR hoặc copy thông tin để chuyển khoản
4. Casso webhook tự động gọi API khi nhận tiền
5. Modal tự động đóng và refresh trang khi thanh toán thành công

---

## 📱 SỬ DỤNG TRÊN MOBILE (FLUTTER)

### 1. Thêm dependency

```bash
cd FrontendMobile
flutter pub get
```

### 2. Import trong screen

```dart
import '../services/payment_service.dart';
import '../screens/payment_modal.dart';
import 'package:shared_preferences/shared_preferences.dart';
```

### 3. Sử dụng trong widget

```dart
// Khởi tạo service
final prefs = await SharedPreferences.getInstance();
final paymentService = PaymentService(prefs);

// Hiển thị modal
showDialog(
  context: context,
  builder: (context) => PaymentModal(
    appointmentId: 123,
    totalAmount: 270000,
    paymentService: paymentService,
  ),
);
```

### 4. Flow thanh toán

1. User nhấn "Tạo mã thanh toán"
2. Hiển thị QR code Flutter + thông tin chuyển khoản
3. User quét QR hoặc copy thông tin
4. Auto-polling trạng thái mỗi 3 giây
5. Hiển thị success và tự động đóng khi thanh toán xong

---

## 🔧 SETUP WEBHOOK (BẮT BUỘC)

### 1. Chạy ngrok (nếu chưa)

```bash
ngrok http 5000
```

### 2. Lấy URL từ ngrok

```
https://nonabidingly-peevedly-marybeth.ngrok-free.dev
```

### 3. Setup webhook trên Casso Dashboard

1. Đăng nhập https://app.casso.vn/
2. Menu bên trái → **"Thiết lập"** (Settings) → **"Webhook"**
3. Nhập URL: `https://[your-ngrok-url]/api/payment/casso-webhook`
   - Ví dụ: `https://nonabidingly-peevedly-marybeth.ngrok-free.dev/api/payment/casso-webhook`
4. Nhấn **"Lưu"** (Save)
5. Nhấn **"Test Webhook"** để kiểm tra

### 4. Verify webhook hoạt động

- Check log backend: `Received Casso webhook: {...}`
- Nếu thành công → Webhook đã sẵn sàng

---

## 🧪 TEST THANH TOÁN

### Test Flow hoàn chỉnh

1. **Tạo payment qua API**

   ```bash
   POST http://localhost:5000/api/payment/create
   {
     "appointmentId": 1,
     "totalAmount": 1000,
     "paymentMethod": "bank_transfer"
   }
   ```

2. **Lấy thông tin chuyển khoản từ response**

   - QR Code URL
   - Số tài khoản: 0977135812
   - Nội dung: `THANHTOAN {paymentId}`

3. **Chuyển khoản 1,000 VND**

   - Mở app MB Bank
   - Chuyển đến: 0977135812 - DO HOANG THANH
   - Nội dung: `THANHTOAN 123` (thay 123 = PaymentId thực tế)
   - Số tiền: ĐÚNG số tiền trong payment

4. **Chờ 5-10 giây**

   - Casso nhận webhook từ ngân hàng
   - Casso gọi webhook của bạn
   - Backend tự động update `Status = "Paid"`

5. **Verify trong database**
   ```sql
   SELECT * FROM Payment WHERE PaymentId = 123
   -- Status = 'Paid', TransactionId = '...', PaymentDate = updated
   ```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### Backend

- ⚠️ **Backend phải đang chạy** khi webhook gọi đến
- ⚠️ **Ngrok phải đang chạy** để public localhost
- ⚠️ Webhook URL phải CHÍNH XÁC, bao gồm `/api/payment/casso-webhook`

### Nội dung chuyển khoản

- ⚠️ **PHẢI đúng format**: `THANHTOAN {paymentId}`
- ⚠️ Ví dụ: `THANHTOAN 123` (không dấu cách thừa)
- ⚠️ Case-insensitive: `thanhtoan 123` cũng được

### Số tiền

- ⚠️ **PHẢI khớp chính xác** với `TotalAmount` trong Payment
- ⚠️ Cho phép sai lệch < 1 đồng (do làm tròn)
- ⚠️ Nếu số tiền không khớp → Không tự động xác nhận

### Production

- ⚠️ Thay ngrok → Domain thật (VPS, Cloud)
- ⚠️ Update webhook URL trên Casso khi đổi domain
- ⚠️ Setup HTTPS cho webhook (bắt buộc)

---

## 📚 API REFERENCE

### Create Payment

```http
POST /api/payment/create
Authorization: Bearer {token}

{
  "appointmentId": 123,
  "totalAmount": 270000,
  "paymentMethod": "bank_transfer",
  "promoCode": "GIAM10" // optional
}
```

**Response:**

```json
{
  "paymentId": 123,
  "totalAmount": 270000,
  "qrCodeUrl": "00020101021238570010A00000072701270006970422011209771358120208QRIBFTTA530370454061000005802VN62150811THANHTOAN 1236304...",
  "transferContent": "THANHTOAN 123",
  "bankName": "MB Bank",
  "accountNumber": "0977135812",
  "accountName": "DO HOANG THANH"
}
```

### Get Payment Status (for polling)

```http
GET /api/payment/{paymentId}
Authorization: Bearer {token}
```

**Response:**

```json
{
  "paymentId": 123,
  "status": "Paid", // or "Pending"
  "totalAmount": 270000,
  "paymentDate": "2025-12-16T10:30:00"
}
```

### Casso Webhook (auto-called)

```http
POST /api/payment/casso-webhook
X-Secure-Token: {checksum}

{
  "data": [
    {
      "tid": "FT25123012345678",
      "amount": 1000,
      "description": "THANHTOAN 123",
      "when": "2025-12-16T10:30:00"
    }
  ]
}
```

---

## 🎯 NEXT STEPS

1. **Setup Casso Webhook** (nếu chưa)

   - Vào Casso Dashboard
   - Thiết lập webhook URL

2. **Test Payment Flow**

   - Tạo payment qua API hoặc UI
   - Chuyển khoản thử 1,000 VND
   - Verify tự động cập nhật status

3. **Integrate vào UI**

   - Web: Thêm PaymentModal vào màn hình booking
   - Mobile: Thêm PaymentModal vào appointment detail

4. **Production Deployment**
   - Deploy backend lên VPS/Cloud
   - Update webhook URL trên Casso
   - Test với real bank transfer

---

## 📞 TROUBLESHOOTING

### Webhook không nhận được

- ✅ Check backend đang chạy: `http://localhost:5000/api/payment/casso-webhook`
- ✅ Check ngrok đang chạy: `ngrok http 5000`
- ✅ Check webhook URL đúng trên Casso Dashboard
- ✅ Check log backend: `Received Casso webhook`

### Payment không tự động Paid

- ✅ Check nội dung CK đúng format: `THANHTOAN {id}`
- ✅ Check số tiền khớp chính xác
- ✅ Check PaymentId tồn tại trong database
- ✅ Check webhook checksum verification pass

### QR Code không hiển thị

- ✅ Web: Check `npm install qrcode` đã chạy
- ✅ Mobile: Check `flutter pub get` đã chạy
- ✅ Check response có `qrCodeUrl` field

---

**Tất cả đã sẵn sàng! Chỉ cần setup webhook là có thể sử dụng ngay!** 🚀
