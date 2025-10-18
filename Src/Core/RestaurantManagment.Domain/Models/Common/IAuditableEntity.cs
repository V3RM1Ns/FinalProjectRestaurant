namespace RestaurantManagment.Domain.Models.Common;

public interface IAuditableEntity
{
    // Audit fields
    DateTime CreatedAt { get; set; }
    string? CreatedBy { get; set; }
    DateTime? UpdatedAt { get; set; }
    string? UpdatedBy { get; set; }
    
    // Soft Delete fields
    bool IsDeleted { get; set; }
    DateTime? DeletedAt { get; set; }
    string? DeletedBy { get; set; }
}