using System.ComponentModel.DataAnnotations;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Application.DTOs.Order;

public class UpdateOrderDto
{
    [Required]
    public string Id { get; set; } = string.Empty;

    public OrderStatus Status { get; set; }

    [MaxLength(50)]
    public string? PaymentMethod { get; set; }

    public string? DeliveryPersonId { get; set; }

    public decimal? DiscountAmount { get; set; }
}

