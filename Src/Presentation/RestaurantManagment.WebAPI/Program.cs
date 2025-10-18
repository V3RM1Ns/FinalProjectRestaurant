using Microsoft.AspNetCore.Identity;
using RestaurantManagment.Application;
using RestaurantManagment.Domain.Models;
using RestaurantManagment.Persistance;
using RestaurantManagment.Persistance.Data;

namespace RestaurantManagment.WebAPI;
public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllers();
        // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
        builder.Services.AddOpenApi();
        
        // Application Layer
        builder.Services.AddApplication();
        
        // Persistence Layer
        builder.Services.AddPersistance(builder.Configuration);
        
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
        }).AddEntityFrameworkStores<AppDbContext>();

        var app = builder.Build();

        // Rolleri ve kullanıcıları oluştur
        using (var scope = app.Services.CreateScope())
        {
            var services = scope.ServiceProvider;
            await DbInitializer.InitializeAsync(services);
        }

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        app.UseHttpsRedirection();
        app.UseAuthorization();
        app.MapControllers();

        app.Run();
    }
}