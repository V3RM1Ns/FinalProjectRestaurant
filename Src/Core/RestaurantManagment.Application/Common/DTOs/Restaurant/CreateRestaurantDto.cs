using System.ComponentModel.DataAnnotations;

namespace RestaurantManagment.Application.DTOs.Restaurant;

public class CreateRestaurantDto
{
    [Required(ErrorMessage = "Restaurant adı zorunludur")]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Adres zorunludur")]
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;

    [Required(ErrorMessage = "Telefon numarası zorunludur")]
    [Phone]
    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [EmailAddress]
    [MaxLength(100)]
    public string? Email { get; set; }

    [Url]
    [MaxLength(200)]
    public string? Website { get; set; }

    [Required(ErrorMessage = "Açıklama zorunludur")]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Sahip ID zorunludur")]
    public string OwnerId { get; set; } = string.Empty;
}

