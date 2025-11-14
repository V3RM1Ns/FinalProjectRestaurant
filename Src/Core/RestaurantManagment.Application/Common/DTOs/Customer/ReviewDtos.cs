namespace RestaurantManagment.Application.Common.DTOs.Customer;

public class CreateReviewDto
{
    public string RestaurantId { get; set; } = string.Empty;
    public string? OrderId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}

public class UpdateReviewDto
{
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}

