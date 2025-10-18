using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Persistance.Configurations;

public class RestaurantConfiguration : IEntityTypeConfiguration<Restaurant>
{
    public void Configure(EntityTypeBuilder<Restaurant> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.Address)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(r => r.PhoneNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(r => r.Email)
            .HasMaxLength(100);

        builder.Property(r => r.Website)
            .HasMaxLength(200);

        builder.Property(r => r.Description)
            .IsRequired()
            .HasMaxLength(2000);

        // Relationships
        builder.HasOne(r => r.Owner)
            .WithMany(u => u.OwnedRestaurants)
            .HasForeignKey(r => r.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(r => r.Employees)
            .WithOne(u => u.EmployerRestaurant)
            .HasForeignKey(u => u.EmployerRestaurantId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(r => r.Name);
        builder.HasIndex(r => r.OwnerId);

        // Soft Delete Query Filter
        builder.HasQueryFilter(r => !r.IsDeleted);
    }
}

