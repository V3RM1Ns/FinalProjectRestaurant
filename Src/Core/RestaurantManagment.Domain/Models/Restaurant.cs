using System.ComponentModel.DataAnnotations;
using RestaurantManagment.Domain.Enums;
using RestaurantManagment.Domain.Models.Common;

namespace RestaurantManagment.Domain.Models;

public class Restaurant : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(20)]
    [Phone]
    public string PhoneNumber { get; set; } = string.Empty;
    
    [MaxLength(100)]
    [EmailAddress]
    public string? Email { get; set; }
    
    [MaxLength(200)]
    [Url]
    public string? Website { get; set; }
    
    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? ImageUrl { get; set; }
    
    public RestaurantCategory? Category { get; set; }
    
    public double? Latitude { get; set; }
    
    public double? Longitude { get; set; }
    
    [Required]
    [MaxLength(450)]
    public string OwnerId { get; set; } = string.Empty;
    public AppUser Owner { get; set; } = null!;
    
    public decimal Rate { get; set; }
    
    public ICollection<Menu> Menus { get; set; } = new List<Menu>();
    public ICollection<Table> Tables { get; set; } = new List<Table>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<AppUser> Employees { get; set; } = new List<AppUser>();
    public ICollection<JobPosting> JobPostings { get; set; } = new List<JobPosting>();
}