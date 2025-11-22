using System.ComponentModel.DataAnnotations;
using RestaurantManagment.Domain.Models.Common;

namespace RestaurantManagment.Domain.Models;

public class RestaurantApplication : BaseEntity
{
    [Required]
    public string OwnerId { get; set; } = string.Empty;
    public AppUser Owner { get; set; } = null!;

    [Required]
    [MaxLength(200)]
    public string RestaurantName { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    [Phone]
    public string PhoneNumber { get; set; } = string.Empty;

    [MaxLength(100)]
    [EmailAddress]
    public string? Email { get; set; }

    [MaxLength(200)]
    public string? Website { get; set; }

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    [MaxLength(2000)]
    public string? AdditionalNotes { get; set; }

    public RestaurantApplicationStatus Status { get; set; } = RestaurantApplicationStatus.Pending;

    public DateTime ApplicationDate { get; set; } = DateTime.UtcNow;

    public DateTime? ReviewedAt { get; set; }
    
    public string? ReviewedBy { get; set; }
    public AppUser? Reviewer { get; set; }

    [MaxLength(1000)]
    public string? RejectionReason { get; set; }
    
    public string? CreatedRestaurantId { get; set; }
}

public enum RestaurantApplicationStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

