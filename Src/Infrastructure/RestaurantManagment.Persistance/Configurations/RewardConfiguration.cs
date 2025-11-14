using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Persistance.Configurations;

public class RewardConfiguration : IEntityTypeConfiguration<Reward>
{
    public void Configure(EntityTypeBuilder<Reward> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.RestaurantId)
            .IsRequired();

        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(r => r.PointsRequired)
            .IsRequired();

        builder.Property(r => r.DiscountAmount)
            .HasColumnType("decimal(18,2)");

        builder.Property(r => r.IsActive)
            .IsRequired();

        builder.Property(r => r.CurrentRedemptions)
            .HasDefaultValue(0);

        builder.HasOne(r => r.Restaurant)
            .WithMany()
            .HasForeignKey(r => r.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasIndex(r => r.RestaurantId);
        builder.HasIndex(r => r.IsActive);
        
        builder.HasQueryFilter(r => !r.IsDeleted);
    }
}

