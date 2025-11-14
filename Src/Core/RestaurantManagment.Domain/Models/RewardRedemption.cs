using System.ComponentModel.DataAnnotations;
using RestaurantManagment.Domain.Models.Common;

namespace RestaurantManagment.Domain.Models;

public class RewardRedemption : BaseEntity
{
    [Required]
    public string CustomerId { get; set; } = string.Empty;
    public AppUser Customer { get; set; } = null!;

    [Required]
    public string RewardId { get; set; } = string.Empty;
    public Reward Reward { get; set; } = null!;

    [Required]
    public int PointsSpent { get; set; }

    public DateTime RedeemedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(100)]
    public string? CouponCode { get; set; }

    public bool IsUsed { get; set; } = false;

    public DateTime? UsedAt { get; set; }

    public string? OrderId { get; set; }
    public Order? Order { get; set; }

    public DateTime? ExpiryDate { get; set; }
}
