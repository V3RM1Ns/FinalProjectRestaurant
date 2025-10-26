namespace RestaurantManagment.Application.Common.DTOs.Order;

public class OrderDto
{
    public int Id { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal? TaxAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? SpecialRequests { get; set; }
    public string? PaymentMethod { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public int RestaurantId { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public int? TableId { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? DeliveryPersonId { get; set; }
    public List<OrderItemDto> OrderItems { get; set; } = new();
}

public class OrderItemDto
{
    public int Id { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
    public string? Notes { get; set; }
    public int MenuItemId { get; set; }
    public string MenuItemName { get; set; } = string.Empty;
    public int OrderId { get; set; }
}

public class CreateOrderDto
{
    public string Type { get; set; } = string.Empty;
    public string? SpecialRequests { get; set; }
    public string? PaymentMethod { get; set; }
    public int RestaurantId { get; set; }
    public int? TableId { get; set; }
    public string? DeliveryAddress { get; set; }
    public List<CreateOrderItemDto> OrderItems { get; set; } = new();
}

public class CreateOrderItemDto
{
    public int MenuItemId { get; set; }
    public int Quantity { get; set; }
    public string? Notes { get; set; }
}

public class UpdateOrderDto
{
    public string Status { get; set; } = string.Empty;
    public string? SpecialRequests { get; set; }
}

public class UpdateOrderStatusDto
{
    public string Status { get; set; } = string.Empty;
}

