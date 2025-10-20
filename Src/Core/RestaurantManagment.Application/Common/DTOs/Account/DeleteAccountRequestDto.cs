using System.ComponentModel.DataAnnotations;

namespace RestaurantManagment.Application.Common.DTOs.Account
{
    public class DeleteAccountRequestDto
    {
        [Required(ErrorMessage = "Silme türü gereklidir")]
        public string DeleteType { get; set; } = string.Empty; // "soft" veya "hard"
    }
}