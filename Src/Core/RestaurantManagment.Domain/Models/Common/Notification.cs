namespace RestaurantManagment.Domain.Models.Common;

public class Notification : BaseEntity
{
    public string Message { get; set; } = string.Empty;

    public string RestaurantId { get; set; }
    public Restaurant Restaurant { get; set; } = null!;

    public string? UserId { get; set; }
    public AppUser? User { get; set; }

    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
