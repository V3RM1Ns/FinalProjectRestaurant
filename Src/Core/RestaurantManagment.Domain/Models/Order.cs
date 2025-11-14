using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RestaurantManagment.Domain.Models.Common;

namespace RestaurantManagment.Domain.Models;

public class Order : BaseEntity
{
    [Required]
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? TaxAmount { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? DiscountAmount { get; set; }
    
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    
    public OrderType Type { get; set; } = OrderType.DineIn;
    
    [MaxLength(2000)]
    public string? SpecialRequests { get; set; }
    
    [MaxLength(50)]
    public string? PaymentMethod { get; set; }
    
    public DateTime? CompletedAt { get; set; }
    
 
    public string? CustomerId { get; set; }
    public AppUser? Customer { get; set; }
    
   
    [Required]
    public string RestaurantId { get; set; } = string.Empty;
    public Restaurant Restaurant { get; set; } = null!;
    
   
    public string? TableId { get; set; }
    public Table? Table { get; set; }
    
   
    [MaxLength(500)]
    public string? DeliveryAddress { get; set; }
    
    public string? DeliveryPersonId { get; set; }
    public AppUser? DeliveryPerson { get; set; }
    
    // Navigation properties
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}

public enum OrderStatus 
{
    Pending,
    Confirmed,
    Preparing,
    Ready,
    Served,
    Completed,
    Cancelled,
}

public enum OrderType
{
    DineIn,
    Takeout,
    Delivery
}