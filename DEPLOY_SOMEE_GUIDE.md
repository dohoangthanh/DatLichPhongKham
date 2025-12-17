# 🎯 HƯỚNG DẪN DEPLOY LÊN SOMEE.COM (FREE)

## 📋 Lý do chọn Somee.com

- ✅ FREE 100% - Không cần thẻ
- ✅ ASP.NET Core support
- ✅ SQL Server FREE (20MB)
- ✅ Deploy nhanh (30 phút)
- ⚠️ Có quảng cáo nhỏ (có thể ẩn)

---

## 🔧 BƯỚC 1: Đăng ký Somee.com

### 1.1. Tạo tài khoản:

1. Truy cập: https://somee.com
2. Click **"Sign Up"** (góc phải trên)
3. Điền thông tin:
   - Username: `phongkham` (hoặc tên bạn muốn)
   - Email: email của bạn
   - Password: mật khẩu mạnh
4. Verify email
5. Login vào Control Panel

### 1.2. Tạo website:

1. Trong Control Panel, click **"Create New Website"**
2. Chọn **"ASP.NET"** hosting
3. Subdomain: `phongkham` (sẽ có domain: `phongkham.somee.com`)
4. Click **"Create"**

---

## 📊 BƯỚC 2: Tạo SQL Server Database

### 2.1. Tạo database trong Somee Control Panel:

1. Vào **"Database Manager"** → **"MS SQL"**
2. Click **"Create New Database"**
3. Database Name: `QuanLyKhamBenh`
4. Lưu lại thông tin:
   - **Server**: `phongkham.somee.com` (hoặc IP được cung cấp)
   - **Database**: `db_aa123_phongkham` (tên thật sẽ có prefix)
   - **User**: `db_aa123_phongkham_admin`
   - **Password**: (password bạn đặt)

### 2.2. Lấy Connection String:

```
Server=phongkham.somee.com;Database=db_aa123_phongkham;User Id=db_aa123_phongkham_admin;Password=YourPassword;TrustServerCertificate=True;
```

---

## 🛠️ BƯỚC 3: Chuẩn bị Backend

### 3.1. Cập nhật appsettings.json:

**File: `Backend/QuanLyKhamBenhAPI/appsettings.json`**

Thêm connection string mới:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=QuanLyKhamBenh;Trusted_Connection=True;",
    "SomeeConnection": "Server=phongkham.somee.com;Database=db_aa123_phongkham;User Id=db_aa123_phongkham_admin;Password=YourPassword;TrustServerCertificate=True;"
  }
}
```

### 3.2. Tạo appsettings.Production.json:

**File: `Backend/QuanLyKhamBenhAPI/appsettings.Production.json`**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=phongkham.somee.com;Database=db_aa123_phongkham;User Id=db_aa123_phongkham_admin;Password=YourPassword;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Secret": "PhongKhamDaKhoa_2025_ProductionKey_ChangeMeToSomethingSecure32Chars"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### 3.3. Cập nhật CORS cho domain Somee:

**File: `Backend/QuanLyKhamBenhAPI/Program.cs`**

Tìm:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5265", "http://localhost:3000")
```

Đổi thành:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5265",
            "http://localhost:3000",
            "https://phongkham.somee.com",  // Backend URL
            "https://your-frontend.vercel.app"  // Frontend URL (sẽ update sau)
        )
```

---

## 📦 BƯỚC 4: Build & Deploy Backend

### 4.1. Build Backend:

Mở PowerShell trong folder Backend:

```powershell
cd D:\DatLichPhongKham\Backend\QuanLyKhamBenhAPI

# Clean build
dotnet clean
dotnet build --configuration Release

# Publish
dotnet publish --configuration Release --output ./publish
```

### 4.2. Chạy Migrations vào Somee Database:

**Sửa connection string tạm thời để chạy migration:**

```powershell
# Set environment variable
$env:ASPNETCORE_ENVIRONMENT = "Production"

# Chạy migration vào Somee database
dotnet ef database update --connection "Server=phongkham.somee.com;Database=db_aa123_phongkham;User Id=db_aa123_phongkham_admin;Password=YourPassword;TrustServerCertificate=True;"
```

**Hoặc dùng SQL Server Management Studio (SSMS):**

1. Download SSMS: https://aka.ms/ssmsfullsetup
2. Connect đến Somee SQL Server
3. Run migration scripts thủ công từ folder `Migrations`

### 4.3. Deploy lên Somee:

**Option A: Deploy qua FTP (Khuyến nghị)**

1. **Lấy thông tin FTP từ Somee Control Panel:**

   - FTP Server: `ftp://phongkham.somee.com`
   - Username: `phongkham`
   - Password: (password tài khoản Somee)
   - Port: 21

2. **Dùng FileZilla hoặc WinSCP:**

   - Download FileZilla: https://filezilla-project.org/
   - Connect với thông tin FTP trên
   - Upload tất cả files trong `Backend/QuanLyKhamBenhAPI/publish/` vào folder `/wwwroot/`

3. **Upload web.config:**

Tạo file `web.config` trong folder publish:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <handlers>
        <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
      </handlers>
      <aspNetCore processPath="dotnet"
                  arguments=".\QuanLyKhamBenhAPI.dll"
                  stdoutLogEnabled="true"
                  stdoutLogFile=".\logs\stdout"
                  hostingModel="inprocess" />
      <httpProtocol>
        <customHeaders>
          <add name="Access-Control-Allow-Origin" value="*" />
          <add name="Access-Control-Allow-Methods" value="GET, POST, PUT, DELETE, OPTIONS" />
          <add name="Access-Control-Allow-Headers" value="Content-Type, Authorization" />
        </customHeaders>
      </httpProtocol>
    </system.webServer>
  </location>
</configuration>
```

Upload file này vào `/wwwroot/`

**Option B: Deploy qua Control Panel (Nếu có Git support)**

1. Push code lên GitHub repository
2. Trong Somee Control Panel → Git Deploy
3. Connect repository và auto deploy

---

## 🎨 BƯỚC 5: Deploy Frontend lên Vercel

### 5.1. Update API URL:

**File: `FrontendWeb/services/api.ts`**

Tìm:

```typescript
const API_BASE_URL = "http://localhost:5129/api";
```

Đổi thành:

```typescript
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5129/api";
```

### 5.2. Deploy lên Vercel:

```bash
cd FrontendWeb
npm install -g vercel
vercel login
vercel
```

Khi Vercel hỏi, nhập:

- Environment Variable: `NEXT_PUBLIC_API_URL` = `https://phongkham.somee.com/api`

---

## ✅ BƯỚC 6: Test Production

### Checklist:

- [ ] Backend accessible: `https://phongkham.somee.com/api/`
- [ ] Frontend accessible: `https://your-project.vercel.app`
- [ ] Login hoạt động
- [ ] Tạo appointment
- [ ] Tạo payment
- [ ] Admin xác nhận payment

---

## 🔧 BƯỚC 7: Seed Data (Admin Account)

### Tạo admin account qua SQL:

Connect vào Somee database (qua SSMS hoặc Somee Control Panel → phpMyAdmin):

```sql
-- Tạo admin user
INSERT INTO UserAccount (username, passwordHash, role, patientId, doctorId)
VALUES ('admin', 'AQAAAAIAAYagAAAAEJ...', 'Admin', NULL, NULL);

-- Password hash for "Admin@123" - Nên đổi sau khi login
```

**Hoặc chạy qua Entity Framework:**

```csharp
// Trong Program.cs, thêm seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<QuanLyKhamBenhContext>();

    if (!context.UserAccounts.Any(u => u.Role == "Admin"))
    {
        var passwordHasher = new PasswordHasher<UserAccount>();
        var admin = new UserAccount
        {
            Username = "admin",
            Role = "Admin"
        };
        admin.PasswordHash = passwordHasher.HashPassword(admin, "Admin@123");
        context.UserAccounts.Add(admin);
        context.SaveChanges();
    }
}
```

---

## 🎯 BƯỚC 8: Cấu hình PayOS Webhook

1. Login PayOS: https://my.payos.vn
2. Cài đặt → Webhook
3. URL: `https://phongkham.somee.com/api/payment/payos-webhook`
4. Save

---

## ⚠️ Lưu ý Somee.com

### Giới hạn Free Tier:

- **Database**: 20MB (nếu vượt quá, cần upgrade)
- **Bandwidth**: 5GB/tháng
- **RAM**: 256MB
- **CPU**: Shared, có thể chậm vào giờ cao điểm
- **Ads**: Có quảng cáo somee.com (có thể ẩn bằng CSS)

### Ẩn quảng cáo Somee (Optional):

Thêm vào `FrontendWeb/app/globals.css`:

```css
/* Hide Somee ads iframe */
iframe[src*="somee.com"] {
  display: none !important;
}
```

### Tối ưu hiệu năng:

**Backend:**

- Enable Response Caching
- Optimize database queries
- Use async/await consistently

**Frontend:**

- Optimize images (WebP format)
- Enable Next.js Image Optimization
- Lazy load components

---

## 📊 Monitoring & Logs

### Backend Logs (Somee):

- Control Panel → **"Logs"**
- Download logs để debug

### Frontend Logs (Vercel):

- Vercel Dashboard → **"Deployments"** → **"View Function Logs"**

### Database (Somee):

- Control Panel → **"Database Manager"** → **"phpMyAdmin"**
- View/query database directly

---

## 🔄 Update sau deploy

### Update Backend:

```powershell
cd Backend/QuanLyKhamBenhAPI
dotnet publish --configuration Release --output ./publish
# Upload lại files qua FTP
```

### Update Frontend:

```bash
cd FrontendWeb
git push origin main
# Vercel tự động deploy
```

### Update Database:

```powershell
dotnet ef migrations add MigrationName
dotnet ef database update --connection "SomeeConnectionString"
```

---

## 🆘 Troubleshooting

### Backend không start:

- Check web.config syntax
- Verify .NET runtime version (cần .NET 8)
- Check Application Logs trong Somee Control Panel

### Database connection failed:

- Verify connection string
- Check firewall settings
- Ensure IP allowed in Somee SQL settings

### CORS errors:

- Verify domain trong Program.cs CORS settings
- Check API URL trong frontend (.env)

### Quảng cáo Somee xuất hiện:

- Thêm CSS để ẩn (xem phần Lưu ý ở trên)
- Upgrade lên paid plan để remove ads ($2/month)

---

## 💰 Nâng cấp (nếu cần)

### Somee Paid Plans:

- **Premium**: $2/month
  - No ads
  - 1GB database
  - 50GB bandwidth
  - Custom domain support

### Alternative khi traffic tăng:

- Chuyển sang Azure App Service
- Hoặc VPS (DigitalOcean, Vultr)

---

## 📝 Thông tin Production

### URLs:

- **Backend API**: https://phongkham.somee.com/api
- **Frontend**: https://your-project.vercel.app
- **Admin**: https://your-project.vercel.app/admin

### Credentials:

- **SQL Server**: phongkham.somee.com
- **Database**: db_aa123_phongkham
- **Admin Login**: admin / Admin@123 (đổi sau khi login)

### Support:

- **Somee**: https://somee.com/support
- **Vercel**: https://vercel.com/support

---

## ✅ Checklist hoàn thành

- [ ] Đăng ký Somee.com
- [ ] Tạo SQL Database
- [ ] Build Backend
- [ ] Upload Backend qua FTP
- [ ] Run migrations
- [ ] Deploy Frontend lên Vercel
- [ ] Test toàn bộ chức năng
- [ ] Cấu hình PayOS webhook
- [ ] Seed admin account
- [ ] Update CORS settings
- [ ] Test payment flow

---

**🎉 Chúc mừng! Website đã sẵn sàng!**
