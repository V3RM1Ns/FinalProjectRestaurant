namespace RestaurantManagment.Application.Common.DTOs.JobPosting;

public class JobPostingDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Requirements { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public decimal? Salary { get; set; }
    public string EmploymentType { get; set; } = string.Empty;
    public DateTime PostedDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsActive { get; set; }
    public string RestaurantId { get; set; } = string.Empty;
    public string RestaurantName { get; set; } = string.Empty;
    public int ApplicationCount { get; set; }
}
