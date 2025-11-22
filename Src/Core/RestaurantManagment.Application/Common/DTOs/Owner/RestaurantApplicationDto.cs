using System.ComponentModel.DataAnnotations;

namespace RestaurantManagment.Application.Common.DTOs.Owner;

public class CreateRestaurantApplicationDto
{
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

    [MaxLength(2000)]
    public string? AdditionalNotes { get; set; }
}

public class RestaurantApplicationDto
{
    public string Id { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    public string RestaurantName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? AdditionalNotes { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime ApplicationDate { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewedBy { get; set; }
    public string? ReviewerName { get; set; }
    public string? RejectionReason { get; set; }
    public string? CreatedRestaurantId { get; set; }
}

public class ReviewRestaurantApplicationDto
{
    [Required]
    public bool Approved { get; set; }

    [MaxLength(1000)]
    public string? RejectionReason { get; set; }
}

