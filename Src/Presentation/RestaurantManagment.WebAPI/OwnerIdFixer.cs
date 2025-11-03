using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using RestaurantManagment.Domain.Models;
using RestaurantManagment.Persistance.Data;

namespace RestaurantManagment.WebAPI;

public static class OwnerIdFixer
{
    public static async Task FixRestaurantOwnerIds(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        
        try
        {
            // Owner kullanıcısını bul
            var owner = await userManager.FindByEmailAsync("owner@gmail.com");
            if (owner == null)
            {
                logger.LogWarning("owner@gmail.com kullanıcısı bulunamadı!");
                return;
            }
            
            logger.LogInformation($"Owner bulundu: {owner.Email} (ID: {owner.Id})");
            
            // Tüm aktif restoranları bul
            var restaurants = await context.Restaurants
                .Where(r => !r.IsDeleted)
                .ToListAsync();
            
            if (restaurants.Count == 0)
            {
                logger.LogInformation("Veritabanında restoran bulunamadı.");
                return;
            }
            
            logger.LogInformation($"{restaurants.Count} restoran bulundu, owner ID'leri güncelleniyor...");
            
            // Her restoranın owner ID'sini güncelle
            foreach (var restaurant in restaurants)
            {
                restaurant.OwnerId = owner.Id;
                logger.LogInformation($"✓ {restaurant.Name} -> Owner ID güncellendi");
            }
            
            await context.SaveChangesAsync();
            logger.LogInformation($"✅ {restaurants.Count} restoranın owner ID'si başarıyla güncellendi!");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Owner ID güncellenirken hata oluştu!");
        }
    }
}

