using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Persistance.Configurations;

public class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
{
    public void Configure(EntityTypeBuilder<AppUser> builder)
    {
        builder.Property(u => u.FullName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(u => u.Address)
            .HasMaxLength(500);

        // Indexes
        builder.HasIndex(u => u.FullName);
        builder.HasIndex(u => u.Email);

        // Soft Delete Query Filter
        builder.HasQueryFilter(u => !u.IsDeleted);
    }
}

