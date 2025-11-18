namespace RestaurantManagment.Application.Common.DTOs.Review;

public class ReviewDto
{
    public string Id { get; set; } = string.Empty;
    public string RestaurantId { get; set; } = string.Empty;
    public string RestaurantName { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? OwnerResponse { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    
    public bool IsReported { get; set; }
    public string? ReportReason { get; set; }
    public DateTime? ReportedAt { get; set; }
    public string? AdminNote { get; set; }
}

public class CreateReviewDto
{
    public string RestaurantId { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}

public class UpdateReviewDto
{
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}

public class ReviewResponseDto
{
    public string Response { get; set; } = string.Empty;
}

public class ReportReviewDto
{
    public string Reason { get; set; } = string.Empty;
}

public class AdminReviewActionDto
{
    public string? Note { get; set; }
}
