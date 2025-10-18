using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Persistance.Configurations;

public class MenuItemConfiguration : IEntityTypeConfiguration<MenuItem>
{
    public void Configure(EntityTypeBuilder<MenuItem> builder)
    {
        builder.HasKey(mi => mi.Id);

        builder.Property(mi => mi.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(mi => mi.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(mi => mi.Price)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(mi => mi.ImageUrl)
            .HasMaxLength(200);

        builder.Property(mi => mi.Category)
            .HasMaxLength(100);

        // Relationships
        builder.HasOne(mi => mi.Menu)
            .WithMany(m => m.MenuItems)
            .HasForeignKey(mi => mi.MenuId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(mi => mi.MenuId);
        builder.HasIndex(mi => mi.Category);

        // Soft Delete Query Filter
        builder.HasQueryFilter(mi => !mi.IsDeleted);
    }
}

