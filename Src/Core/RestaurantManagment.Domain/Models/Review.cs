using System.ComponentModel.DataAnnotations;
using RestaurantManagment.Domain.Models.Common;

namespace RestaurantManagment.Domain.Models;

public class Review : BaseEntity
{
    [Required]
    public string CustomerId { get; set; } = string.Empty;
    public AppUser Customer { get; set; } = null!;

    [Required]
    public string RestaurantId { get; set; } = string.Empty;
    public Restaurant Restaurant { get; set; } = null!;

    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    [Required]
    [MaxLength(1000)]
    public string Comment { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; 

    [MaxLength(1000)]
    public string? OwnerResponse { get; set; }

    public DateTime? RespondedAt { get; set; }
}

