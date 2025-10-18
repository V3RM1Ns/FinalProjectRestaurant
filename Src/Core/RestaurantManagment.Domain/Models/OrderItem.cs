using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RestaurantManagment.Domain.Models.Common;

namespace RestaurantManagment.Domain.Models;

public class OrderItem : BaseEntity
{
    [Required]
    [Range(1, 999)]
    public int Quantity { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; }
    
    [MaxLength(500)]
    public string? Notes { get; set; }
    

    [Required]
    public string MenuItemId { get; set; } = string.Empty;
    public MenuItem MenuItem { get; set; } = null!;
    
    
    [Required]
    public string OrderId { get; set; } = string.Empty;
    public Order Order { get; set; } = null!;

    
    
    public void CalculateSubtotal()
    {
        Subtotal = Quantity * UnitPrice;
    }
}
