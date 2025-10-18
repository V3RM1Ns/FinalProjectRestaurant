namespace RestaurantManagment.Application.DTOs.Restaurant;

public class RestaurantResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string Description { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

