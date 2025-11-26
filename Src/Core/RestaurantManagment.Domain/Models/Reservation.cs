using System.ComponentModel.DataAnnotations;
using RestaurantManagment.Domain.Models.Common;

namespace RestaurantManagment.Domain.Models;

public class Reservation : BaseEntity
{
    [Required]
    public DateTime ReservationDate { get; set; }
    
    [Required]
    [Range(1, 100)]
    public int NumberOfGuests { get; set; }
    
    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    
    [MaxLength(1000)]
    public string? SpecialRequests { get; set; }

    [Required]
    [MaxLength(200)]
    public string CustomerName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(20)]
    [Phone]
    public string CustomerPhone { get; set; } = string.Empty;
    
    [MaxLength(100)]
    [EmailAddress]
    public string? CustomerEmail { get; set; }
    
    
    public string? CustomerId { get; set; }
    public AppUser? Customer { get; set; }
    
    
    [Required]
    public string RestaurantId { get; set; } = string.Empty;
    public Restaurant Restaurant { get; set; } = null!;
    
 
    [Required]
    public string TableId { get; set; } = string.Empty;
    public Table Table { get; set; } = null!;
}

public enum ReservationStatus
{
    Pending,
    Confirmed,
    Cancelled,
    Completed,
}