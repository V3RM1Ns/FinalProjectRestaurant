using System.ComponentModel.DataAnnotations;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Application.DTOs.Reservation;

public class UpdateReservationDto
{
    [Required]
    public string Id { get; set; } = string.Empty;

    public DateTime ReservationDate { get; set; }

    [Range(1, 100)]
    public int NumberOfGuests { get; set; }

    public ReservationStatus Status { get; set; }

    [MaxLength(1000)]
    public string? SpecialRequests { get; set; }
}

