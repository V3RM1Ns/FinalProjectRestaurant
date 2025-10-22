namespace RestaurantManagment.Application.Common.DTOs.Restaurant;

public class RestaurantAdminListDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public DateTime CreatedAt { get; set; }
}
