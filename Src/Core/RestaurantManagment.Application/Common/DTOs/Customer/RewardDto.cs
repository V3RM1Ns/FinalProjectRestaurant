namespace RestaurantManagment.Application.Common.DTOs.Customer;

public class RewardDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PointsRequired { get; set; }
    public DateTime ExpiryDate { get; set; }
    public bool IsRedeemed { get; set; }
}

