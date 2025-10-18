using System.ComponentModel.DataAnnotations;

namespace RestaurantManagment.Application.Common.DTOs.JobApplication;

public class CreateJobApplicationDto
{
    [Required]
    public string JobPostingId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(2000)]
    public string CoverLetter { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? ResumeUrl { get; set; }
}

