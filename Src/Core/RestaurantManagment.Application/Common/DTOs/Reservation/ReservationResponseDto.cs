using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Application.DTOs.Reservation;

public class ReservationResponseDto
{
    public string Id { get; set; } = string.Empty;
    public DateTime ReservationDate { get; set; }
    public int NumberOfGuests { get; set; }
    public ReservationStatus Status { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string? SpecialRequests { get; set; }
    
    public string RestaurantId { get; set; } = string.Empty;
    public string RestaurantName { get; set; } = string.Empty;
    
    public string TableId { get; set; } = string.Empty;
    public int TableNumber { get; set; }
    
    public string? CustomerId { get; set; }
    public DateTime CreatedAt { get; set; }
}

