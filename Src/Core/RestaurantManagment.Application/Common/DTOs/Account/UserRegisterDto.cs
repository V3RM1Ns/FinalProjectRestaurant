using System.ComponentModel.DataAnnotations;

namespace RestaurantManagment.Application.Common.DTOs.Account;

public class UserRegisterDto
{
    [Required]
    public string FullName { get; set; } = string.Empty;
    [Required]
    public string Email { get; set; } = string.Empty;
    [Required]
    [MinLength(6)]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;
    [Required]
    [MinLength(6)]
    [DataType(DataType.Password)]
    [Compare("Password", ErrorMessage ="password not match")]
    public string ConfirmPassword { get; set; } = string.Empty;
    public string? Phone { get; set; }
    
}