using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Persistance.Configurations;

public class RewardRedemptionConfiguration : IEntityTypeConfiguration<RewardRedemption>
{
    public void Configure(EntityTypeBuilder<RewardRedemption> builder)
    {
        builder.HasKey(rr => rr.Id);

        builder.Property(rr => rr.CustomerId)
            .IsRequired();

        builder.Property(rr => rr.RewardId)
            .IsRequired();

        builder.Property(rr => rr.PointsSpent)
            .IsRequired();

        builder.Property(rr => rr.RedeemedAt)
            .IsRequired();

        builder.Property(rr => rr.IsUsed)
            .IsRequired()
            .HasDefaultValue(false);

        builder.HasOne(rr => rr.Customer)
            .WithMany()
            .HasForeignKey(rr => rr.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(rr => rr.Reward)
            .WithMany()
            .HasForeignKey(rr => rr.RewardId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(rr => rr.Order)
            .WithMany()
            .HasForeignKey(rr => rr.OrderId)
            .OnDelete(DeleteBehavior.SetNull);
        
        builder.HasIndex(rr => rr.CustomerId);
        builder.HasIndex(rr => rr.RewardId);
        builder.HasIndex(rr => rr.CouponCode);
        
        builder.HasQueryFilter(rr => !rr.IsDeleted);
    }
}


