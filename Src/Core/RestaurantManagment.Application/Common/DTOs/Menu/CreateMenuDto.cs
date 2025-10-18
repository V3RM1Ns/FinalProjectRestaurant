using System.ComponentModel.DataAnnotations;

namespace RestaurantManagment.Application.DTOs.Menu;

public class CreateMenuDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string RestaurantId { get; set; } = string.Empty;
}

