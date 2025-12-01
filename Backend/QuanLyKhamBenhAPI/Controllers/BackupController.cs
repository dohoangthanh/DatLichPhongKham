using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace QuanLyKhamBenhAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class BackupController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly string _backupPath;

        public BackupController(IConfiguration configuration)
        {
            _configuration = configuration;
            _backupPath = Path.Combine(Directory.GetCurrentDirectory(), "Backups");

            // Tạo thư mục Backups nếu chưa có
            if (!Directory.Exists(_backupPath))
            {
                Directory.CreateDirectory(_backupPath);
            }
        }

        // GET /api/backup/create - Tạo backup file
        [HttpGet("create")]
        public async Task<IActionResult> CreateBackup()
        {
            try
            {
                var connectionString = _configuration.GetConnectionString("DefaultConnection");
                if (string.IsNullOrEmpty(connectionString))
                {
                    return StatusCode(500, new { message = "Connection string không tìm thấy" });
                }

                var serverName = ExtractServerName(connectionString);
                var databaseName = ExtractDatabaseName(connectionString);

                // Tạo tên file backup với timestamp (giờ Việt Nam - UTC+7)
                var vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(
                    DateTime.UtcNow,
                    TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time")
                );
                var timestamp = vietnamTime.ToString("yyyyMMdd_HHmmss");
                var backupFileName = $"QuanLyKhamBenh_Backup_{timestamp}.bak";
                var backupFilePath = Path.Combine(_backupPath, backupFileName);

                // Chuyển đường dẫn sang dạng SQL Server chấp nhận
                backupFilePath = backupFilePath.Replace("\\", "\\\\");

                // SQL command để backup - escape quotes properly
                var backupCommand = $"BACKUP DATABASE [{databaseName}] TO DISK = N'{backupFilePath}' WITH FORMAT, MEDIANAME = 'SQLServerBackups', NAME = 'Full Backup of {databaseName}'";

                // Thực thi backup bằng sqlcmd với -b để dừng nếu có lỗi
                var processInfo = new ProcessStartInfo
                {
                    FileName = "sqlcmd",
                    Arguments = $"-S \"{serverName}\" -d master -Q \"{backupCommand}\" -b",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                string output = "";
                string error = "";

                using (var process = Process.Start(processInfo))
                {
                    if (process == null)
                    {
                        return StatusCode(500, new { message = "Không thể khởi tạo process backup" });
                    }

                    output = await process.StandardOutput.ReadToEndAsync();
                    error = await process.StandardError.ReadToEndAsync();
                    await process.WaitForExitAsync();

                    if (process.ExitCode != 0)
                    {
                        return StatusCode(500, new
                        {
                            message = $"Backup thất bại",
                            error = error,
                            output = output,
                            exitCode = process.ExitCode
                        });
                    }
                }

                // Đợi một chút để file được ghi xong
                await Task.Delay(500);

                // Chuyển về đường dẫn bình thường
                backupFilePath = backupFilePath.Replace("\\\\", "\\");

                // Kiểm tra file đã được tạo
                if (!System.IO.File.Exists(backupFilePath))
                {
                    return StatusCode(500, new
                    {
                        message = "File backup không được tạo",
                        path = backupFilePath,
                        output = output
                    });
                }

                // Đọc file và trả về
                var fileBytes = await System.IO.File.ReadAllBytesAsync(backupFilePath);

                return File(fileBytes, "application/octet-stream", backupFileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = $"Lỗi khi backup: {ex.Message}",
                    detail = ex.ToString()
                });
            }
        }

        // POST /api/backup/restore - Restore từ file upload
        [HttpPost("restore")]
        public async Task<IActionResult> RestoreBackup(IFormFile backupFile)
        {
            if (backupFile == null || backupFile.Length == 0)
            {
                return BadRequest(new { message = "Vui lòng chọn file backup" });
            }

            try
            {
                var connectionString = _configuration.GetConnectionString("DefaultConnection");
                if (string.IsNullOrEmpty(connectionString))
                {
                    return StatusCode(500, new { message = "Connection string không tìm thấy" });
                }

                var serverName = ExtractServerName(connectionString);
                var databaseName = ExtractDatabaseName(connectionString);

                // Lưu file upload tạm
                var tempFilePath = Path.Combine(_backupPath, $"temp_{backupFile.FileName}");
                using (var stream = new FileStream(tempFilePath, FileMode.Create))
                {
                    await backupFile.CopyToAsync(stream);
                }

                // SQL command để restore
                var restoreCommand = $@"
                    ALTER DATABASE [{databaseName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                    RESTORE DATABASE [{databaseName}] 
                    FROM DISK = N'{tempFilePath}' 
                    WITH REPLACE;
                    ALTER DATABASE [{databaseName}] SET MULTI_USER;";

                // Thực thi restore
                var processInfo = new ProcessStartInfo
                {
                    FileName = "sqlcmd",
                    Arguments = $"-S \"{serverName}\" -Q \"{restoreCommand}\" -E",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using (var process = Process.Start(processInfo))
                {
                    if (process == null)
                    {
                        return StatusCode(500, new { message = "Không thể khởi tạo process restore" });
                    }

                    await process.WaitForExitAsync();
                    var output = await process.StandardOutput.ReadToEndAsync();
                    var error = await process.StandardError.ReadToEndAsync();

                    if (process.ExitCode != 0)
                    {
                        // Xóa file tạm
                        if (System.IO.File.Exists(tempFilePath))
                        {
                            System.IO.File.Delete(tempFilePath);
                        }
                        return StatusCode(500, new { message = $"Restore thất bại: {error}" });
                    }
                }

                // Xóa file tạm
                if (System.IO.File.Exists(tempFilePath))
                {
                    System.IO.File.Delete(tempFilePath);
                }

                return Ok(new { message = "Restore database thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi khi restore: {ex.Message}" });
            }
        }

        // GET /api/backup/list - Lấy danh sách backup files
        [HttpGet("list")]
        public IActionResult GetBackupFiles()
        {
            try
            {
                var files = Directory.GetFiles(_backupPath, "*.bak")
                    .Select(f => new
                    {
                        fileName = Path.GetFileName(f),
                        size = new FileInfo(f).Length,
                        createdDate = System.IO.File.GetCreationTime(f)
                    })
                    .OrderByDescending(f => f.createdDate)
                    .ToList();

                return Ok(files);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi khi lấy danh sách backup: {ex.Message}" });
            }
        }

        private string ExtractServerName(string connectionString)
        {
            var parts = connectionString.Split(';');
            var serverPart = parts.FirstOrDefault(p => p.Trim().StartsWith("Server=", StringComparison.OrdinalIgnoreCase));
            if (serverPart != null)
            {
                return serverPart.Split('=')[1].Trim();
            }
            return "(localdb)\\MSSQLLocalDB";
        }

        private string ExtractDatabaseName(string connectionString)
        {
            var parts = connectionString.Split(';');
            var dbPart = parts.FirstOrDefault(p => p.Trim().StartsWith("Database=", StringComparison.OrdinalIgnoreCase));
            if (dbPart != null)
            {
                return dbPart.Split('=')[1].Trim();
            }
            return "QuanLyKhamBenh";
        }
    }
}
