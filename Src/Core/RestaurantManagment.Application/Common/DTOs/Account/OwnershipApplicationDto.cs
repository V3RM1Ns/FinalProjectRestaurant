namespace RestaurantManagment.Application.Common.DTOs.Account;

public class OwnershipApplicationDto
{
    public string UserId { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public string BusinessDescription { get; set; } = string.Empty;
    public string BusinessAddress { get; set; } = string.Empty;
    public string BusinessPhone { get; set; } = string.Empty;
    public string? BusinessEmail { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? AdditionalNotes { get; set; }
}