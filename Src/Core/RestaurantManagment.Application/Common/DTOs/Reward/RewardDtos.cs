namespace RestaurantManagment.Application.Common.DTOs.Reward;

public class RewardDto
{
    public string Id { get; set; } = string.Empty;
    public string RestaurantId { get; set; } = string.Empty;
    public string RestaurantName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PointsRequired { get; set; }
    public decimal? DiscountAmount { get; set; }
    public int? DiscountPercentage { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? MaxRedemptions { get; set; }
    public int CurrentRedemptions { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateRewardDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PointsRequired { get; set; }
    public decimal? DiscountAmount { get; set; }
    public int? DiscountPercentage { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? MaxRedemptions { get; set; }
}

public class UpdateRewardDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PointsRequired { get; set; }
    public decimal? DiscountAmount { get; set; }
    public int? DiscountPercentage { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? MaxRedemptions { get; set; }
}

