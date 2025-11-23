using Microsoft.Extensions.DependencyInjection;
using RestaurantManagment.Application.Common.Interfaces;
using RestaurantManagment.Infrastructure.Services;

namespace RestaurantManagment.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAccountService, AccountService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IOwnerService, OwnerService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<ILoyaltyService, LoyaltyService>();
        services.AddScoped<IFileService, FileService>();
        
        return services;
    }
}
