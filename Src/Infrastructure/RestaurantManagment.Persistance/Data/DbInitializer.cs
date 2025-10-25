using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using RestaurantManagment.Domain.Models;
using RestaurantManagment.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace RestaurantManagment.Persistance.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<AppUser>>();
        var context = serviceProvider.GetRequiredService<IAppDbContext>();

        // Roller
        string[] roles = { "Admin", "RestaurantOwner", "Employee", "Customer", "Delivery" };

        // Rolleri oluştur
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // Her rol için kullanıcı oluştur
        await CreateUserIfNotExists(userManager, "admin@restaurant.com", "Admin123!", "Admin User", "Admin");
        var owner = await CreateUserIfNotExists(userManager, "owner@restaurant.com", "Owner123!", "Restaurant Owner", "RestaurantOwner");
        await CreateUserIfNotExists(userManager, "employee@restaurant.com", "Employee123!", "Employee User", "Employee");
        await CreateUserIfNotExists(userManager, "customer@restaurant.com", "Customer123!", "Customer User", "Customer");
        await CreateUserIfNotExists(userManager, "delivery@restaurant.com", "Delivery123!", "Delivery User", "Delivery");

        // Owner için restoran oluştur
        if (owner != null)
        {
            var existingRestaurant = await context.Restaurants
                .FirstOrDefaultAsync(r => r.OwnerId == owner.Id && !r.IsDeleted);

            if (existingRestaurant == null)
            {
                var restaurant = new Restaurant
                {
                    Name = "Demo Restaurant",
                    Address = "İstanbul, Türkiye",
                    PhoneNumber = "+905551234567",
                    Email = "info@demorestaurant.com",
                    Description = "Demo restoran açıklaması",
                    OwnerId = owner.Id,
                    Rate = 4.5m
                };

                context.Restaurants.Add(restaurant);
                await context.SaveChangesAsync();
            }
        }
    }

    private static async Task<AppUser?> CreateUserIfNotExists(
        UserManager<AppUser> userManager,
        string email,
        string password,
        string fullName,
        string role)
    {
        // Önce tüm kullanıcıları kontrol et (IsDeleted dahil)
        var existingUser = userManager.Users.FirstOrDefault(u => u.Email == email);

        if (existingUser != null)
        {
            // Kullanıcı silinmişse, tekrar aktif et
            if (existingUser.IsDeleted)
            {
                existingUser.IsDeleted = false;
                existingUser.EmailConfirmed = true;
                await userManager.UpdateAsync(existingUser);

                // Role kontrolü
                var roles = await userManager.GetRolesAsync(existingUser);
                if (!roles.Contains(role))
                {
                    await userManager.AddToRoleAsync(existingUser, role);
                }
            }
            return existingUser;
        }

        // Kullanıcı yoksa yeni oluştur
        var user = new AppUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            FullName = fullName
        };

        var result = await userManager.CreateAsync(user, password);
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(user, role);
            return user;
        }

        return null;
    }
}
