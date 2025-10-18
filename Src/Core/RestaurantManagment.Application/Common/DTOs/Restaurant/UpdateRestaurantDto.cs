using System.ComponentModel.DataAnnotations;

namespace RestaurantManagment.Application.DTOs.Restaurant;

public class UpdateRestaurantDto
{
    [Required]
    public string Id { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;

    [Required]
    [Phone]
    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [EmailAddress]
    [MaxLength(100)]
    public string? Email { get; set; }

    [Url]
    [MaxLength(200)]
    public string? Website { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;
}

