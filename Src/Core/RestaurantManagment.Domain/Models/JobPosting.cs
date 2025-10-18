using System.ComponentModel.DataAnnotations;
using RestaurantManagment.Domain.Models;
using RestaurantManagment.Domain.Models.Common;

public class JobPosting : BaseEntity
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
    public string EmploymentType { get; set; } = string.Empty; // Full-time, Part-time, Contract
    
    public DateTime PostedDate { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiryDate { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    [Required]
    public string RestaurantId { get; set; } = string.Empty;
    public Restaurant Restaurant { get; set; } = null!;
    
    public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
}