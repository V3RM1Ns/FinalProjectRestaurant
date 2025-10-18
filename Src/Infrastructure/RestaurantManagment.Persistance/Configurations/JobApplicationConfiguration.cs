using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Persistance.Configurations;

public class JobApplicationConfiguration : IEntityTypeConfiguration<JobApplication>
{
    public void Configure(EntityTypeBuilder<JobApplication> builder)
    {
        builder.HasKey(j => j.Id);

        builder.Property(j => j.CoverLetter)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(j => j.ResumeUrl)
            .HasMaxLength(500);

        builder.Property(j => j.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(j => j.ReviewNotes)
            .HasMaxLength(1000);

        // Relationships
        builder.HasOne(j => j.JobPosting)
            .WithMany(jp => jp.Applications)
            .HasForeignKey(j => j.JobPostingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(j => j.Applicant)
            .WithMany(u => u.JobApplications)
            .HasForeignKey(j => j.ApplicantId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(j => j.JobPostingId);
        builder.HasIndex(j => j.ApplicantId);
        builder.HasIndex(j => j.Status);

        // Soft Delete Query Filter
        builder.HasQueryFilter(j => !j.IsDeleted);
    }
}

public class JobPostingConfiguration : IEntityTypeConfiguration<JobPosting>
{
    public void Configure(EntityTypeBuilder<JobPosting> builder)
    {
        builder.HasKey(j => j.Id);

        builder.Property(j => j.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(j => j.Description)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(j => j.Requirements)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(j => j.Position)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(j => j.EmploymentType)
            .IsRequired()
            .HasMaxLength(50);

        // Relationships
        builder.HasOne(j => j.Restaurant)
            .WithMany(r => r.JobPostings)
            .HasForeignKey(j => j.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(j => j.RestaurantId);
        builder.HasIndex(j => j.IsActive);

        // Soft Delete Query Filter
        builder.HasQueryFilter(j => !j.IsDeleted);
    }
}

