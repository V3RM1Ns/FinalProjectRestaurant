using System.ComponentModel.DataAnnotations;
using RestaurantManagment.Domain.Models.Common;

namespace RestaurantManagment.Domain.Models;

public class OwnershipApplication : BaseEntity
{
    [Required]
    public string UserId { get; set; } = string.Empty;
    public AppUser User { get; set; } = null!;

    [Required]
    [MaxLength(500)]
    public string BusinessName { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string BusinessDescription { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string BusinessAddress { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    [Phone]
    public string BusinessPhone { get; set; } = string.Empty;

    [MaxLength(100)]
    [EmailAddress]
    public string? BusinessEmail { get; set; }

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? AdditionalNotes { get; set; }

  
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;

    public DateTime ApplicationDate { get; set; } = DateTime.UtcNow;

    public DateTime? ReviewedAt { get; set; }
    
    public string? ReviewedBy { get; set; }
    public AppUser? Reviewer { get; set; }

    [MaxLength(1000)]
    public string? RejectionReason { get; set; }

    
    public bool IsDeleted { get; set; } = false;
}

public enum ApplicationStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

