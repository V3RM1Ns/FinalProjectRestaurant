using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Persistance.Configurations;

public class LoyaltyPointConfiguration : IEntityTypeConfiguration<LoyaltyPoint>
{
    public void Configure(EntityTypeBuilder<LoyaltyPoint> builder)
    {
        builder.HasKey(lp => lp.Id);

        builder.Property(lp => lp.CustomerId)
            .IsRequired();

        builder.Property(lp => lp.RestaurantId)
            .IsRequired();

        builder.Property(lp => lp.Points)
            .IsRequired();

        builder.Property(lp => lp.Type)
            .IsRequired();

        builder.Property(lp => lp.EarnedAt)
            .IsRequired();

        builder.HasOne(lp => lp.Customer)
            .WithMany()
            .HasForeignKey(lp => lp.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(lp => lp.Restaurant)
            .WithMany()
            .HasForeignKey(lp => lp.RestaurantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(lp => lp.Order)
            .WithMany()
            .HasForeignKey(lp => lp.OrderId)
            .OnDelete(DeleteBehavior.SetNull);
        
        builder.HasIndex(lp => lp.CustomerId);
        builder.HasIndex(lp => lp.RestaurantId);
        builder.HasIndex(lp => new { lp.CustomerId, lp.RestaurantId });

        builder.HasQueryFilter(lp => !lp.IsDeleted);
    }
}