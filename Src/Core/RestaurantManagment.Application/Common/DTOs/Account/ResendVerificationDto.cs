using System.ComponentModel.DataAnnotations;

namespace RestaurantManagment.Application.Common.DTOs.Account;

public class ResendVerificationDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

