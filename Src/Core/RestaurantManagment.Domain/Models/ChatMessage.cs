using RestaurantManagment.Domain.Models.Common;

namespace RestaurantManagment.Domain.Models;

public class ChatMessage : BaseEntity
{
    public string OrderId { get; set; } = null!;
    public Order Order { get; set; } = null!;
    
    public string SenderId { get; set; } = null!;
    public string SenderName { get; set; } = null!;
    public string SenderRole { get; set; } = null!;
    
    public string Content { get; set; } = null!;
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
}

