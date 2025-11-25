using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Persistance.Configurations;

public class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
{
    public void Configure(EntityTypeBuilder<Reservation> builder)
    {
        builder.HasKey(res => res.Id);

        builder.Property(res => res.ReservationDate)
            .IsRequired();

        builder.Property(res => res.NumberOfGuests)
            .IsRequired();

        builder.Property(res => res.CustomerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(res => res.CustomerPhone)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(res => res.CustomerEmail)
            .HasMaxLength(100);

        builder.Property(res => res.SpecialRequests)
            .HasMaxLength(1000);

        builder.HasOne(res => res.Restaurant)
            .WithMany(r => r.Reservations)
            .HasForeignKey(res => res.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(res => res.Table)
            .WithMany(t => t.Reservations)
            .HasForeignKey(res => res.TableId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(res => res.Customer)
            .WithMany(u => u.Reservations)
            .HasForeignKey(res => res.CustomerId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasIndex(res => res.ReservationDate);
        builder.HasIndex(res => res.RestaurantId);
        builder.HasIndex(res => res.CustomerId);

        builder.HasQueryFilter(res => !res.IsDeleted);
    }
}

