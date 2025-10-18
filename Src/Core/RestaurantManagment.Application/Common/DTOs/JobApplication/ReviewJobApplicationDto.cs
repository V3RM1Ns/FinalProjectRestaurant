using System.ComponentModel.DataAnnotations;

namespace RestaurantManagment.Application.Common.DTOs.JobApplication;

public class ReviewJobApplicationDto
{
    [Required]
    public string ApplicationId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty; // Accepted or Rejected
    
    [MaxLength(1000)]
    public string? ReviewNotes { get; set; }
}

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

