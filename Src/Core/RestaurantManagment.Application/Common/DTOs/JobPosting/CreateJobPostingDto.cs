using System.ComponentModel.DataAnnotations;

namespace RestaurantManagment.Application.Common.DTOs.JobPosting;

public class CreateJobPostingDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(1000)]
    public string Requirements { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Position { get; set; } = string.Empty;
    
    public decimal? Salary { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string EmploymentType { get; set; } = string.Empty;
    
    public DateTime? ExpiryDate { get; set; }
    
    [Required]
    public string RestaurantId { get; set; } = string.Empty;
}

