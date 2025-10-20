namespace RestaurantManagment.Application.Common.DTOs.Account;

using System.ComponentModel.DataAnnotations;

public class UserProfileDto
{
    [Required(ErrorMessage = "Ad zorunludur")]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Soyad zorunludur")]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Kullanıcı adı zorunludur")]
    [MaxLength(100)]
    public string UserName { get; set; } = string.Empty;

    [Required(ErrorMessage = "E-posta zorunludur")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz")]
    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }
    public string? Address { get; set; }
}