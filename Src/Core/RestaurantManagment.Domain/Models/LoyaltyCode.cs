using System.ComponentModel.DataAnnotations;
using RestaurantManagment.Domain.Models.Common;

namespace RestaurantManagment.Domain.Models;

public class LoyaltyCode : BaseEntity
{
    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required]
    public int PointValue { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    public string CreatedByAdminId { get; set; } = string.Empty;
    public AppUser CreatedByAdmin { get; set; } = null!;

    public bool IsActive { get; set; } = true;

    public int? MaxUses { get; set; }

    public int CurrentUses { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ExpiryDate { get; set; }

    public bool IsUsed { get; set; } = false;

    public string? UsedByCustomerId { get; set; }
    public AppUser? UsedByCustomer { get; set; }

    public DateTime? UsedAt { get; set; }

    public string? RestaurantId { get; set; }
    public Restaurant? Restaurant { get; set; }
}
