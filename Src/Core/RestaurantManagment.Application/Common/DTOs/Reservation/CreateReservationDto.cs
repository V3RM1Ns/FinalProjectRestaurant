using System.ComponentModel.DataAnnotations;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Application.DTOs.Reservation;

public class CreateReservationDto
{
    [Required]
    public DateTime ReservationDate { get; set; }

    [Required]
    [Range(1, 100)]
    public int NumberOfGuests { get; set; }

    [Required]
    [MaxLength(200)]
    public string CustomerName { get; set; } = string.Empty;

    [Required]
    [Phone]
    [MaxLength(20)]
    public string CustomerPhone { get; set; } = string.Empty;

    [EmailAddress]
    [MaxLength(100)]
    public string? CustomerEmail { get; set; }

    [MaxLength(1000)]
    public string? SpecialRequests { get; set; }

    [Required]
    public string RestaurantId { get; set; } = string.Empty;

    [Required]
    public string TableId { get; set; } = string.Empty;

    public string? CustomerId { get; set; }
}

