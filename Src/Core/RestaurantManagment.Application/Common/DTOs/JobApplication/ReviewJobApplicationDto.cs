using System.ComponentModel.DataAnnotations;

namespace RestaurantManagment.Application.Common.DTOs.JobApplication;

public class ReviewJobApplicationDto
{
    [Required]
    public string ApplicationId { get; set; } = string.Empty;

    [Required] [MaxLength(50)] public string Status { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? ReviewNotes { get; set; }
}
