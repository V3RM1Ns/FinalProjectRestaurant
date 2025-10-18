using System.ComponentModel.DataAnnotations;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Application.DTOs.Order;

public class CreateOrderDto
{
    [Required]
    public string RestaurantId { get; set; } = string.Empty;

    public string? TableId { get; set; }
    
    public string? CustomerId { get; set; }

    [Required]
    public OrderType Type { get; set; } = OrderType.DineIn;

    [MaxLength(2000)]
    public string? SpecialRequests { get; set; }

    [MaxLength(500)]
    public string? DeliveryAddress { get; set; }

    [Required]
    public List<CreateOrderItemDto> Items { get; set; } = new();
}

public class CreateOrderItemDto
{
    [Required]
    public string MenuItemId { get; set; } = string.Empty;

    [Required]
    [Range(1, 999)]
    public int Quantity { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

