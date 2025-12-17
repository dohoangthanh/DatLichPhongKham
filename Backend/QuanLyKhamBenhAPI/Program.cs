using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Cryptography;
using QuanLyKhamBenhAPI.Models;
using QuanLyKhamBenhAPI.Services;
using QuanLyKhamBenhAPI.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<QuanLyKhamBenhContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IAuthService>(provider =>
{
    var context = provider.GetRequiredService<QuanLyKhamBenhContext>();
    var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "YourSecretKeyHere";
    return new AuthService(context, jwtSecret);
});
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Chatbot Services
builder.Services.AddScoped<ChatbotService>();
builder.Services.AddScoped<LocalChatbotService>();

// Payment Services
builder.Services.AddScoped<VietQRService>();
builder.Services.AddScoped<CassoService>();
// PayOSService không sử dụng - chỉ dùng Casso webhook
// builder.Services.AddScoped<PayOSService>();
builder.Services.AddHttpClient();

// JWT Configuration
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "YourSecretKeyHere";
var key = Encoding.ASCII.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };

    // Hỗ trợ SignalR với JWT token qua query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chatHub"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// SignalR
builder.Services.AddSignalR();
builder.Services.AddSingleton<Microsoft.AspNetCore.SignalR.IUserIdProvider, QuanLyKhamBenhAPI.Hubs.CustomUserIdProvider>();

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5265",
                "http://localhost:3000",
                "https://quanlyphongkham.vercel.app",
                "https://quanlyphongkham-c6vxtrfoa-djo-hoang-thanhs-projects.vercel.app"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "QuanLyKhamBenh API",
        Version = "v1"
    });
    c.CustomSchemaIds(type => type.FullName);
});
builder.Services.AddHttpClient();

var app = builder.Build();

// Configure the HTTP request pipeline.
// Enable Swagger for all environments
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "QuanLyKhamBenh API v1");
    c.RoutePrefix = "swagger";
});

//Add a test endpoint
app.MapGet("/", () => "QuanLyKhamBenh API is running!");
app.MapGet("/health", () => "OK");

// HTTPS Redirection disabled for Somee.com compatibility
// if (!app.Environment.IsDevelopment())
// {
//     app.UseHttpsRedirection();
// }

// Enable CORS
app.UseCors("AllowFrontend");

// Enable Static Files for uploaded images
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<QuanLyKhamBenhAPI.Hubs.ChatHub>("/chatHub");

app.Run();
