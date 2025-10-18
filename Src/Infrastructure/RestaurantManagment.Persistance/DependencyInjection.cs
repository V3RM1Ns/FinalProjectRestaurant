using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RestaurantManagment.Application.Common.Interfaces;
using RestaurantManagment.Domain.Models;
using RestaurantManagment.Persistance.Data;

namespace RestaurantManagment.Persistance;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistance(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

        services.AddScoped<IAppDbContext, AppDbContext>();
        return services;
    }
}