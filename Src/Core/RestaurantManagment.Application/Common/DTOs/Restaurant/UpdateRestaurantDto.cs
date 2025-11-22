using Microsoft.AspNetCore.Http;

namespace RestaurantManagment.Application.Common.DTOs.Restaurant;

public class UpdateRestaurantDto
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Latitude { get; set; }
    public string? Longitude { get; set; }
    public IFormFile? ImageFile { get; set; }
}
