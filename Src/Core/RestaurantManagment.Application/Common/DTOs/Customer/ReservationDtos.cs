namespace RestaurantManagment.Application.Common.DTOs.Customer;

public class CreateReservationDto
{
    public string RestaurantId { get; set; } = string.Empty;
    public string? TableId { get; set; }
    public DateTime ReservationDate { get; set; }
    public int PartySize { get; set; }
    public string? SpecialRequests { get; set; }
}

public class UpdateReservationDto
{
    public DateTime ReservationDate { get; set; }
    public int PartySize { get; set; }
    public string? SpecialRequests { get; set; }
}

