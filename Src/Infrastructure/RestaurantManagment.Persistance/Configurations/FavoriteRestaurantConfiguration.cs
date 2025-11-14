using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Persistance.Configurations;

public class FavoriteRestaurantConfiguration : IEntityTypeConfiguration<FavoriteRestaurant>
{
    public void Configure(EntityTypeBuilder<FavoriteRestaurant> builder)
    {
        builder.HasKey(f => f.Id);

        builder.Property(f => f.CustomerId)
            .IsRequired();

        builder.Property(f => f.RestaurantId)
            .IsRequired();

        builder.Property(f => f.AddedAt)
            .IsRequired();
        
        builder.HasOne(f => f.Customer)
            .WithMany()
            .HasForeignKey(f => f.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(f => f.Restaurant)
            .WithMany()
            .HasForeignKey(f => f.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasIndex(f => new { f.CustomerId, f.RestaurantId })
            .IsUnique();
        
        builder.HasQueryFilter(f => !f.IsDeleted);
    }
}

