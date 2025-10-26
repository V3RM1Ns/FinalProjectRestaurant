namespace RestaurantManagment.Application.Common.DTOs.MenuItem;

public class MenuItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; }
    public string? ImageUrl { get; set; }
    public string? Category { get; set; }
    public int MenuId { get; set; }
    public string MenuName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class UpdateMenuItemAvailabilityDto
{
    public bool IsAvailable { get; set; }
}
