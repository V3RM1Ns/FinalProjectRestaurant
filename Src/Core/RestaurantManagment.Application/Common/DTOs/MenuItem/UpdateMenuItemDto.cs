using System.ComponentModel.DataAnnotations;

namespace RestaurantManagment.Application.Common.DTOs.MenuItem;

public class UpdateMenuItemDto
{
    [Required]
    public string Id { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [Range(0.01, 999999.99)]
    public decimal Price { get; set; }

    [MaxLength(200)]
    public string? ImageUrl { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; }

    public bool IsAvailable { get; set; }
}
