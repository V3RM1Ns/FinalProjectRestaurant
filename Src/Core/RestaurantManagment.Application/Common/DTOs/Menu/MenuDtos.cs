namespace RestaurantManagment.Application.Common.DTOs.Menu;

public class MenuDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int RestaurantId { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<RestaurantManagment.Application.Common.DTOs.MenuItem.MenuItemDto> MenuItems { get; set; } = new();
}

public class CreateMenuDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class UpdateMenuDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
