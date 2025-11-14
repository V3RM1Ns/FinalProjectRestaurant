using System.ComponentModel.DataAnnotations;
using RestaurantManagment.Domain.Models.Common;

namespace RestaurantManagment.Domain.Models;

public class FavoriteRestaurant : BaseEntity
{
    [Required]
    public string CustomerId { get; set; } = string.Empty;
    public AppUser Customer { get; set; } = null!;

    [Required]
    public string RestaurantId { get; set; } = string.Empty;
    public Restaurant Restaurant { get; set; } = null!;

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}

