using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Persistance.Configurations;

public class TableConfiguration : IEntityTypeConfiguration<Table>
{
    public void Configure(EntityTypeBuilder<Table> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.TableNumber)
            .IsRequired();

        builder.Property(t => t.Capacity)
            .IsRequired();

        builder.Property(t => t.Location)
            .HasMaxLength(500);

        builder.HasOne(t => t.Restaurant)
            .WithMany(r => r.Tables)
            .HasForeignKey(t => t.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(t => new { t.RestaurantId, t.TableNumber })
            .IsUnique();

        builder.HasQueryFilter(t => !t.IsDeleted);
    }
}

