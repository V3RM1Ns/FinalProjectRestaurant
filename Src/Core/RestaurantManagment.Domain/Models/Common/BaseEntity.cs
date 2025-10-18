namespace RestaurantManagment.Domain.Models.Common;

public class BaseEntity : IAuditableEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    // Soft Delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }
    
    // Audit
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}