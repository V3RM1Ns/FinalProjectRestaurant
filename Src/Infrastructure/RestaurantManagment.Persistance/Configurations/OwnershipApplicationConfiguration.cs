using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Persistance.Configurations;

public class OwnershipApplicationConfiguration : IEntityTypeConfiguration<OwnershipApplication>
{
    public void Configure(EntityTypeBuilder<OwnershipApplication> builder)
    {
        builder.HasKey(oa => oa.Id);

        // User relationship
        builder.HasOne(oa => oa.User)
            .WithMany(u => u.OwnershipApplications)
            .HasForeignKey(oa => oa.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Reviewer relationship
        builder.HasOne(oa => oa.Reviewer)
            .WithMany(u => u.ReviewedApplications)
            .HasForeignKey(oa => oa.ReviewedBy)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(oa => oa.UserId);
        builder.HasIndex(oa => oa.Status);
        builder.HasIndex(oa => oa.ApplicationDate);

        // Soft delete filter
        builder.HasQueryFilter(oa => !oa.IsDeleted);
    }
}

