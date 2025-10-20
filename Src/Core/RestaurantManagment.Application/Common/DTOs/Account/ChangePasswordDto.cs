using System.ComponentModel.DataAnnotations;

namespace RestaurantManagment.Application.Common.DTOs.Account;

public class ChangePasswordDto
{
    [Required(ErrorMessage = "Mevcut şifre zorunludur")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Yeni şifre zorunludur")]
    [MinLength(6, ErrorMessage = "Şifre en az 6 karakter olmalıdır")]
    public string NewPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre tekrarı zorunludur")]
    [Compare("NewPassword", ErrorMessage = "Şifreler eşleşmiyor")]
    public string ConfirmPassword { get; set; } = string.Empty;
}

