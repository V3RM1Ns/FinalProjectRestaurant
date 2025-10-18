using System.ComponentModel.DataAnnotations;

namespace RestaurantManagment.Application.Common.DTOs.Account;

public class UserRegisterDto
{
    [Required(ErrorMessage = "Ad alanı zorunludur")]
    public string FirstName { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Soyad alanı zorunludur")]
    public string LastName { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Kullanıcı adı zorunludur")]
    [MinLength(3, ErrorMessage = "Kullanıcı adı en az 3 karakter olmalıdır")]
    public string Username { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "E-posta alanı zorunludur")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz")]
    public string Email { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Şifre alanı zorunludur")]
    [MinLength(6, ErrorMessage = "Şifre en az 6 karakter olmalıdır")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Şifre tekrar alanı zorunludur")]
    [MinLength(6)]
    [DataType(DataType.Password)]
    [Compare("Password", ErrorMessage = "Şifreler eşleşmiyor")]
    public string ConfirmPassword { get; set; } = string.Empty;
    
    public string? Phone { get; set; }
}