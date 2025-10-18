using System.ComponentModel.DataAnnotations;

namespace RestaurantManagment.Application.DTOs.Menu;

public class UpdateMenuDto
{
    [Required]
    public string Id { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
}

