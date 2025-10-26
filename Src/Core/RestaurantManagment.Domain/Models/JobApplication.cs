using System.ComponentModel.DataAnnotations;
using RestaurantManagment.Domain.Models.Common;

namespace RestaurantManagment.Domain.Models;

public class JobApplication : BaseEntity
{
    [Required]
    public string JobPostingId { get; set; } = string.Empty;
    public JobPosting JobPosting { get; set; } = null!;

    [Required]
    public string ApplicantId { get; set; } = string.Empty;
    public AppUser Applicant { get; set; } = null!;
    
    [Required]
    [MaxLength(2000)]
    public string CoverLetter { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? ResumeUrl { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Accepted, Rejected
    
    public DateTime ApplicationDate { get; set; } = DateTime.UtcNow;
    
    public DateTime? ReviewedDate { get; set; }

    public string? ReviewedBy { get; set; }
    
    [MaxLength(1000)]
    public string? ReviewNotes { get; set; }
}



