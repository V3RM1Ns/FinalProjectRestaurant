using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RestaurantManagment.Domain.Models.Common;

namespace RestaurantManagment.Domain.Models;

public class MenuItem : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    [Range(0.01, 999999.99)]
    public decimal Price { get; set; }
    
    public bool IsAvailable { get; set; } = true;
    
    [MaxLength(200)]
    public string? ImageUrl { get; set; }
    
    [MaxLength(100)]
    public string? Category { get; set; }
    
    // Menu relationship
    [Required]
    public string MenuId { get; set; } = string.Empty;
    public Menu Menu { get; set; } = null!;
    
    // Navigation properties
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    // Soft delete için IsDeleted
    public bool IsDeleted { get; set; } = false;
}