using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Persistance.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderDate)
            .IsRequired();

        builder.Property(o => o.TotalAmount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(o => o.TaxAmount)
            .HasPrecision(18, 2);

        builder.Property(o => o.DiscountAmount)
            .HasPrecision(18, 2);

        builder.Property(o => o.SpecialRequests)
            .HasMaxLength(2000);

        builder.Property(o => o.PaymentMethod)
            .HasMaxLength(50);

        builder.Property(o => o.DeliveryAddress)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(o => o.Restaurant)
            .WithMany(r => r.Orders)
            .HasForeignKey(o => o.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(o => o.Table)
            .WithMany(t => t.Orders)
            .HasForeignKey(o => o.TableId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(o => o.Customer)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(o => o.DeliveryPerson)
            .WithMany(u => u.DeliveryOrders)
            .HasForeignKey(o => o.DeliveryPersonId)
            .OnDelete(DeleteBehavior.NoAction);

        // Indexes
        builder.HasIndex(o => o.OrderDate);
        builder.HasIndex(o => o.RestaurantId);
        builder.HasIndex(o => o.CustomerId);
        builder.HasIndex(o => o.Status);

        // Soft Delete Query Filter
        builder.HasQueryFilter(o => !o.IsDeleted);
    }
}

