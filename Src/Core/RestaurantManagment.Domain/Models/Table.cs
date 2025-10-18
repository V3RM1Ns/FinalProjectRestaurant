using System.ComponentModel.DataAnnotations;
using RestaurantManagment.Domain.Models.Common;

namespace RestaurantManagment.Domain.Models;

public class Table : BaseEntity
{
    [Required]
    [Range(1, 9999)]
    public int TableNumber { get; set; }
    
    [Required]
    [Range(1, 100)]
    public int Capacity { get; set; }
    
    public TableStatus Status { get; set; } = TableStatus.Available;
    
    [MaxLength(500)]
    public string? Location { get; set; }
    

    [Required]
    public string RestaurantId { get; set; } = string.Empty;
    public Restaurant Restaurant { get; set; } = null!;
    
   
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}

public enum TableStatus
{
    Available,
    Occupied,
    Reserved,
    OutOfService
}