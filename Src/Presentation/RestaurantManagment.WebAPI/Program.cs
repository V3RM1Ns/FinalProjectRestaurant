using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using RestaurantManagment.Application;
using RestaurantManagment.Domain.Models;
using RestaurantManagment.Persistance;
using RestaurantManagment.Persistance.Data;
using RestaurantManagment.Infrastructure;
using RestaurantManagment.WebAPI;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "RestaurantManagment API", Version = "v1" });
    
    // Aynı isimli DTO'lar için schema ID çakışmasını önle
    c.CustomSchemaIds(type => 
    {
        var name = type.FullName?.Replace("+", ".");
        return name;
    });
    
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.\r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Application Layer
builder.Services.AddApplication();

// Persistence Layer
builder.Services.AddPersistance(builder.Configuration);

// Infrastructure Layer
builder.Services.AddInfrastructure();

// Identity
builder.Services.AddIdentity<AppUser, IdentityRole>(opt =>
{
    opt.Password.RequireDigit = true;
    opt.Password.RequireLowercase = true;
    opt.Password.RequireUppercase = true;
    opt.Password.RequireNonAlphanumeric = false;
    opt.User.RequireUniqueEmail = true;
    opt.Lockout.MaxFailedAccessAttempts = 5;
    opt.Lockout.AllowedForNewUsers = true;
    opt.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    opt.SignIn.RequireConfirmedEmail = false; 
    opt.Password.RequiredLength = 6;
}).AddEntityFrameworkStores<AppDbContext>()
  .AddDefaultTokenProviders();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
    
    // SignalR için JWT token desteği
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
        },
        OnChallenge = context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = 401;
            context.Response.ContentType = "application/json";
            var result = System.Text.Json.JsonSerializer.Serialize(new { message = "Unauthorized. Please login again." });
            return context.Response.WriteAsync(result);
        }
    };
});

builder.Services.AddAuthorization();

// SignalR
builder.Services.AddSignalR();

// CORS ekle
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", "https://localhost:3000", "http://localhost:5000") 
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials(); // SignalR için credentials gerekli
        });
});

var app = builder.Build();

// Seed Data - Uygulama başlarken veritabanını doldur
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();
        
        // Veritabanı bağlantısını kontrol et
      //  if (await context.Database.CanConnectAsync())
       // {
       //     logger.LogInformation("⚠️ Mevcut veritabanı siliniyor...");
        //     
        // Veritabanını sil ve yeniden oluştur
        //     await context.Database.EnsureDeletedAsync();
        //    logger.LogInformation("✅ Veritabanı silindi.");
        //    
        //    await context.Database.EnsureCreatedAsync();
        //    logger.LogInformation("✅ Veritabanı oluşturuldu.");
        //    
        //    logger.LogInformation("📝 Seed data oluşturuluyor...");
        //    // SeedData'yı çalıştır
        //    await SeedData.Initialize(services);
        //    
        //    logger.LogInformation("✅ Seed data başarıyla oluşturuldu.");
      //  }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "❌ Seed data oluşturulurken bir hata oluştu.");
        throw; // Hatayı fırlat ki uygulama durmasın ama hata görünsün
    }
}

app.UseCors("AllowReactApp");

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "RestaurantManagment API V1");
    c.RoutePrefix = "swagger";
    c.DocumentTitle = "RestaurantManagment Swagger";
    c.EnablePersistAuthorization();
});
app.MapOpenApi();


app.UseStaticFiles();


var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// SignalR Hub endpoint
app.MapHub<RestaurantManagment.WebAPI.Hubs.ChatHub>("/chatHub");

app.Run();
    
// Partial class for logger generic type
public partial class Program { }
