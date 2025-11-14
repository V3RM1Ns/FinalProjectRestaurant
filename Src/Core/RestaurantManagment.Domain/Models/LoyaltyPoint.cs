using System.ComponentModel.DataAnnotations;
using RestaurantManagment.Domain.Models.Common;

namespace RestaurantManagment.Domain.Models;

public class LoyaltyPoint : BaseEntity
{
    [Required]
    public string CustomerId { get; set; } = string.Empty;
    public AppUser Customer { get; set; } = null!;

    [Required]
    public string RestaurantId { get; set; } = string.Empty;
    public Restaurant Restaurant { get; set; } = null!;

    [Required]
    public int Points { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public LoyaltyPointType Type { get; set; }

    public string? OrderId { get; set; }
    public Order? Order { get; set; }

    public DateTime EarnedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ExpiryDate { get; set; }

    public bool IsRedeemed { get; set; } = false;

    public DateTime? RedeemedAt { get; set; }
}

public enum LoyaltyPointType
{
    Earned,     
    Bonus,       
    Redeemed,    
    Expired,     
    Adjustment 
}

