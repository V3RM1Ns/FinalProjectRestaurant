using System.ComponentModel.DataAnnotations;

namespace RestaurantManagment.Application.Common.DTOs.Account
{
    public class ConfirmDeleteAccountDto
    {
        [Required(ErrorMessage = "Kullanıcı ID gereklidir")]
        public string UserId { get; set; } = string.Empty;

        [Required(ErrorMessage = "Token gereklidir")]
        public string Token { get; set; } = string.Empty;

        [Required(ErrorMessage = "Silme türü gereklidir")]
        public string DeleteType { get; set; } = string.Empty; // "soft" veya "hard"
    }
}



