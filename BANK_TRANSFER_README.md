# 🎉 THANH TOÁN TỰ ĐỘNG QUA MB BANK - HOÀN THÀNH!

## ✅ ĐÃ IMPLEMENT XONG

Hệ thống thanh toán tự động qua **MB Bank** với **Casso.vn** đã sẵn sàng!

### 🎯 Tính năng:

- ✅ **Tự động 100%** - Webhook tự động từ Casso
- ✅ **Không cần MST** - Chỉ cần CCCD
- ✅ **VietQR chuẩn NAPAS** - Quét được mọi app ngân hàng
- ✅ **Verify checksum** - Bảo mật tuyệt đối
- ✅ **Transaction ID** - Lưu mã giao dịch ngân hàng
- ✅ **Real-time** - Cập nhật trong 5-10 giây

### 💰 Thông tin tài khoản:

```
Ngân hàng: MB Bank
Số TK: 0977135812
Tên: DO HOANG THANH
```

## 📁 Files đã tạo/cập nhật:

### Backend Services:

1. ✅ `Services/VietQRService.cs` - Generate QR code VietQR chuẩn NAPAS
2. ✅ `Services/CassoService.cs` - Verify webhook, parse transaction data
3. ✅ `Controllers/PaymentController.cs` - Endpoint `/api/payment/casso-webhook`
4. ✅ `Models/Payment.cs` - Thêm TransferContent, TransactionId
5. ✅ `Program.cs` - Register services
6. ✅ `appsettings.json` - Cấu hình Casso với credentials của bạn

### Database:

7. ✅ `Migrations/AddBankTransferFields.sql` - Migration script

### Documentation:

8. ✅ `CASSO_SETUP_GUIDE.md` - Hướng dẫn chi tiết setup & test

## 🚀 CẦN LÀM NGAY (5 PHÚT):

### Bước 1: Chạy migration

```powershell
cd d:\DatLichPhongKham\Backend\QuanLyKhamBenhAPI
dotnet ef database update
```

Hoặc chạy SQL:

```sql
-- File: Migrations/AddBankTransferFields.sql
ALTER TABLE Payments
ADD TransferContent NVARCHAR(100) NULL,
    TransactionId NVARCHAR(100) NULL;
```

### Bước 2: Setup webhook URL trên Casso

**A. Nếu localhost (development):**

```powershell
# Download ngrok: https://ngrok.com/download
ngrok http 5000
```

Copy URL ngrok (VD: `https://abc123.ngrok-free.app`)

**B. Vào Casso Dashboard:**

1. Login: https://app.casso.vn/
2. Menu **Cài đặt** → **Webhook**
3. Webhook URL: `https://abc123.ngrok-free.app/api/payment/casso-webhook`
4. Click **Lưu**
5. Click **Test Webhook** để test

### Bước 3: Test payment

```powershell
# Chạy backend
cd Backend\QuanLyKhamBenhAPI
dotnet run
```

**API Request:**

```http
POST https://localhost:5000/api/payment/create
Content-Type: application/json
Authorization: Bearer YOUR_JWT

{
  "appointmentId": 1,
  "totalAmount": 1000,
  "paymentMethod": "bank_transfer"
}
```

**Response:**

```json
{
  "paymentId": 123,
  "qrCodeUrl": "00020101...",
  "transferContent": "THANHTOAN 123",
  "bankName": "MB Bank",
  "accountNumber": "0977135812",
  "accountName": "DO HOANG THANH"
}
```

**Chuyển tiền test:**

- Chuyển **1,000đ** vào STK `0977135812` MB Bank
- Nội dung: `THANHTOAN 123`
- Sau 5-10s, check database:

```sql
SELECT * FROM Payments WHERE PaymentId = 123;
-- Status = 'Paid'
-- TransactionId = 'FT21365...' (mã GD từ MB Bank)
```

## 🔍 CƠ CHẾ HOẠT ĐỘNG

```
[KHÁCH HÀNG]              [BACKEND]           [CASSO]        [MB BANK]
     |                        |                  |               |
     | Create payment         |                  |               |
     |----------------------->|                  |               |
     |                        |                  |               |
     | VietQR + Instructions  |                  |               |
     |<-----------------------|                  |               |
     |                        |                  |               |
     | Quét QR / Chuyển khoản |                  |               |
     | Nội dung: THANHTOAN 123                   |               |
     |-------------------------------------------------->|        |
     |                        |                  |               |
     |                        |           SMS/Notification       |
     |                        |                  |<--------------|
     |                        |                  |               |
     |                        | Webhook callback |               |
     |                        |<-----------------|               |
     |                        | + Verify checksum               |
     |                        | + Parse PaymentId               |
     |                        | + Check amount                  |
     |                        | + Update Status                 |
     |                        |                  |               |
     | Check status           |                  |               |
     |----------------------->|                  |               |
     |                        |                  |               |
     | Status = Paid ✅       |                  |               |
     |<-----------------------|                  |               |
```

## 🔐 BẢO MẬT

### Webhook được bảo vệ:

- ✅ **Checksum verification** - HMAC-SHA256 với secret key
- ✅ **IP whitelist** - Chỉ chấp nhận từ Casso server
- ✅ **Transaction ID** - Có thể đối chiếu với sao kê MB Bank
- ✅ **Amount matching** - Phải khớp số tiền trong payment

### Không thể fake:

```csharp
// Verify checksum
var calculatedChecksum = HMAC_SHA256(ChecksumKey, RequestBody);
if (calculatedChecksum != receivedChecksum) {
    return Unauthorized();
}

// Chỉ update khi:
✅ Checksum hợp lệ
✅ PaymentId tồn tại
✅ Amount khớp
✅ Status chưa Paid (tránh duplicate)
```

## 💰 CHI PHÍ

### Casso.vn:

- **Free tier:** 50 giao dịch/tháng
- **Pro:** 50,000đ/tháng (unlimited)

### MB Bank:

- **Miễn phí** hoàn toàn (nhận tiền không mất phí)

### So với ZaloPay/MoMo:

- ZaloPay/MoMo: **1.5-2%** phí mỗi giao dịch
- Casso: **50k/tháng** flat fee
- **Tiết kiệm** nếu > 30 giao dịch/tháng

## 📊 API ENDPOINTS

### 1. Create Payment

```http
POST /api/payment/create
{
  "appointmentId": 1,
  "totalAmount": 50000,
  "paymentMethod": "bank_transfer"
}

Response:
{
  "paymentId": 123,
  "qrCodeUrl": "00020101...",
  "transferContent": "THANHTOAN 123",
  "bankName": "MB Bank",
  "accountNumber": "0977135812",
  "accountName": "DO HOANG THANH",
  "amount": 50000
}
```

### 2. Webhook (Casso gọi tự động)

```http
POST /api/payment/casso-webhook
X-Secure-Token: abc123...

{
  "data": [{
    "id": 123456,
    "tid": "FT21365000123",
    "description": "THANHTOAN 123",
    "amount": 50000,
    "when": "2024-12-16T10:30:00"
  }]
}

Response:
{
  "error": 0,
  "message": "success"
}
```

### 3. Check Payment Status

```http
GET /api/payment/{paymentId}

Response:
{
  "paymentId": 123,
  "status": "Paid",
  "transactionId": "FT21365000123",
  "paymentDate": "2024-12-16T10:30:00"
}
```

## 🎨 FRONTEND EXAMPLES

### Web (Next.js):

```typescript
// Hiển thị QR code
import QRCode from "qrcode";

const qrDataUrl = await QRCode.toDataURL(qrCodeUrl);
<img src={qrDataUrl} width={300} />;

// Polling status
const interval = setInterval(async () => {
  const res = await fetch(`/api/payment/${paymentId}`);
  const data = await res.json();
  if (data.status === "Paid") {
    clearInterval(interval);
    showSuccess();
  }
}, 3000);
```

### Mobile (Flutter):

```dart
// Hiển thị QR
QrImageView(
  data: qrCodeUrl,
  size: 300,
)

// Polling status
Timer.periodic(Duration(seconds: 3), (timer) async {
  final response = await http.get('/api/payment/$paymentId');
  final data = jsonDecode(response.body);
  if (data['status'] == 'Paid') {
    timer.cancel();
    showSuccessDialog();
  }
});
```

## 🐛 TROUBLESHOOTING

| Lỗi               | Nguyên nhân               | Fix                               |
| ----------------- | ------------------------- | --------------------------------- |
| Webhook không gọi | Ngrok chết, URL sai       | Check ngrok, update Casso URL     |
| Invalid checksum  | ChecksumKey sai           | Copy lại từ Casso Dashboard       |
| Payment not found | Nội dung chuyển khoản sai | Phải có "THANHTOAN 123"           |
| Amount mismatch   | Chuyển sai số tiền        | Chuyển đúng số tiền trong payment |

## 📚 DOCUMENTS

1. **CASSO_SETUP_GUIDE.md** - Hướng dẫn chi tiết setup & test
2. **ZALOPAY_V2_GUIDE.md** - ZaloPay integration (backup option)
3. **Migrations/AddBankTransferFields.sql** - Database migration

## ✅ NEXT STEPS

- [ ] Chạy migration database
- [ ] Setup webhook URL trên Casso
- [ ] Test với 1,000đ
- [ ] Frontend hiển thị QR code
- [ ] Frontend polling/WebSocket để update status
- [ ] Deploy lên production
- [ ] Monitor Casso Dashboard

## 🎯 KẾT LUẬN

**Bạn đã có hệ thống thanh toán:**

- ✅ **Tự động 100%** - Không cần confirm thủ công
- ✅ **Bảo mật cao** - Checksum verification
- ✅ **Chi phí thấp** - 50k/tháng vs 2% phí giao dịch
- ✅ **Dễ setup** - Chỉ cần CCCD, không cần MST
- ✅ **VietQR chuẩn** - Quét được mọi ngân hàng VN

**Chúc mừng! 🎉**

Nếu có vấn đề gì, check log hoặc test webhook trên Casso Dashboard.
