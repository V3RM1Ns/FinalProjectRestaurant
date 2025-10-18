namespace RestaurantManagment.Domain.Models.Common;

public interface ISoftDeletable
{
    bool IsDeleted { get; set; }
    DateTime? DeletedAt { get; set; }
    string DeletedBy { get; set; }
}