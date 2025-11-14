public class LoyaltyCodeDto
{
    public string Id { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public int PointValue { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public int? MaxUses { get; set; }
    public int CurrentUses { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsUsed { get; set; }
    public string? UsedByCustomerId { get; set; }
    public DateTime? UsedAt { get; set; }
    public string? RestaurantId { get; set; }
}
public class CreateLoyaltyCodeDto
{
    public int PointValue { get; set; }
    public string? Description { get; set; }
    public int? MaxUses { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? RestaurantId { get; set; }
}