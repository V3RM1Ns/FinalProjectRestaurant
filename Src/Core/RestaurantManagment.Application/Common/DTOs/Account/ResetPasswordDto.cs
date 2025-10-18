using System.ComponentModel.DataAnnotations;

namespace RestaurantManagment.Application.Common.DTOs.Account;

public class ResetPasswordDto
{
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    public string Token { get; set; } = string.Empty;
    
    [Required]
    [MinLength(6, ErrorMessage = "Şifre en az 6 karakter olmalıdır")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;
    
    [Required]
    [Compare("Password", ErrorMessage = "Şifreler eşleşmiyor")]
    [DataType(DataType.Password)]
    public string ConfirmPassword { get; set; } = string.Empty;
}

