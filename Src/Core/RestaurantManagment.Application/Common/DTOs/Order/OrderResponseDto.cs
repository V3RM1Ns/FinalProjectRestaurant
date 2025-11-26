using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Application.DTOs.Order;

public class OrderResponseDto
{
    public string Id { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal? TaxAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    public OrderStatus Status { get; set; }
    public OrderType Type { get; set; }
    public string? SpecialRequests { get; set; }
    public string? PaymentMethod { get; set; }
    public DateTime? CompletedAt { get; set; }
    
    public string RestaurantId { get; set; } = string.Empty;
    public string RestaurantName { get; set; } = string.Empty;
    
    public string? TableId { get; set; }
    public int? TableNumber { get; set; }
    
    public string? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    
    public string? DeliveryPersonId { get; set; }
    public string? DeliveryPersonName { get; set; }
    
    public string? DeliveryAddress { get; set; }
    
    public List<OrderItemResponseDto> OrderItems { get; set; } = new();
}

public class OrderItemResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string MenuItemId { get; set; } = string.Empty;
    public string MenuItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
    public string? Notes { get; set; }
}
