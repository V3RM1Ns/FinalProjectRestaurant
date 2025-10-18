using System.ComponentModel.DataAnnotations;

namespace RestaurantManagment.Application.Common.DTOs.Account;

public class ForgotPasswordDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }
}