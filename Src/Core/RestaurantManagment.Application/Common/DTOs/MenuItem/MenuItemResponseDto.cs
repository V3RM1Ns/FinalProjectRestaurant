namespace RestaurantManagment.Application.DTOs.MenuItem;

public class MenuItemResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public string? Category { get; set; }
    public bool IsAvailable { get; set; }
    public string MenuId { get; set; } = string.Empty;
    public string MenuName { get; set; } = string.Empty;
}

