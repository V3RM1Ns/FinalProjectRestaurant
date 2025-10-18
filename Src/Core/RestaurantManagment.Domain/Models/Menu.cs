using System.ComponentModel.DataAnnotations;
using RestaurantManagment.Domain.Models.Common;

namespace RestaurantManagment.Domain.Models;

public class Menu : BaseEntity
{
    [Required] [MaxLength(200)] public string Name { get; set; } = string.Empty;

    [Required] [MaxLength(1000)] public string Description { get; set; } = string.Empty;


    [Required] public string RestaurantId { get; set; } = string.Empty;
    public Restaurant Restaurant { get; set; } = null!;

    // Menu-MenuItem ilişkisi
    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
}
