namespace RestaurantManagment.Application.Common.DTOs.Reservation;

public class ReservationDto
{
    public int Id { get; set; }
    public DateTime ReservationDate { get; set; }
    public int NumberOfGuests { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? SpecialRequests { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string? CustomerId { get; set; }
    public int RestaurantId { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public int TableId { get; set; }
    public int? TableNumber { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateReservationDto
{
    public DateTime ReservationDate { get; set; }
    public int NumberOfGuests { get; set; }
    public string? SpecialRequests { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public int RestaurantId { get; set; }
    public int TableId { get; set; }
}

public class UpdateReservationDto
{
    public DateTime ReservationDate { get; set; }
    public int NumberOfGuests { get; set; }
    public string? SpecialRequests { get; set; }
    public int TableId { get; set; }
}

public class UpdateReservationStatusDto
{
    public string Status { get; set; } = string.Empty;
}

