using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using RestaurantManagment.Domain.Models.Common;

namespace RestaurantManagment.Domain.Models;

public class AppUser : IdentityUser, IAuditableEntity
{
    [Required]
    [MaxLength(200)]
    public string FullName { get; set; } = string.Empty;
    
    
    [MaxLength(500)]
    public string? Address { get; set; }
    
    public string? Phone { get; set; } = string.Empty;
    
    public ICollection<Restaurant> OwnedRestaurants { get; set; } = new List<Restaurant>();
    
   
    public string? EmployerRestaurantId { get; set; }
    public Restaurant? EmployerRestaurant { get; set; }
    
   
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    

    public ICollection<Order> DeliveryOrders { get; set; } = new List<Order>();
    
    // Ownership Applications
    public ICollection<OwnershipApplication> OwnershipApplications { get; set; } = new List<OwnershipApplication>();
    public ICollection<OwnershipApplication> ReviewedApplications { get; set; } = new List<OwnershipApplication>();
    
    // Job Applications
    public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
