namespace RestaurantManagment.Application.Common.DTOs.Loyalty;

public class LoyaltyPointDto
{
    public string Id { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public string RestaurantId { get; set; } = string.Empty;
    public string RestaurantName { get; set; } = string.Empty;
    public int Points { get; set; }
    public string? Description { get; set; }
    public string Type { get; set; } = string.Empty;
    public DateTime EarnedAt { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsRedeemed { get; set; }
}

public class CustomerLoyaltyBalanceDto
{
    public string CustomerId { get; set; } = string.Empty;
    public string RestaurantId { get; set; } = string.Empty;
    public string RestaurantName { get; set; } = string.Empty;
    public int TotalPoints { get; set; }
    public int AvailablePoints { get; set; }
    public int RedeemedPoints { get; set; }
    public List<LoyaltyPointDto> RecentTransactions { get; set; } = new();
}

