using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Application.Common.DTOs.Customer;

public class CreateOrderDto
{
    public string RestaurantId { get; set; } = string.Empty;
    public string? DeliveryAddress { get; set; }
    public string? DeliveryInstructions { get; set; }
    public OrderType OrderType { get; set; }
    public string? PaymentMethod { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class UpdateOrderDto
{
    public string? DeliveryAddress { get; set; }
    public string? DeliveryInstructions { get; set; }
}

public class OrderItemDto
{
    public string MenuItemId { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? SpecialInstructions { get; set; }
}

