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
        
        return services;
    }
}
