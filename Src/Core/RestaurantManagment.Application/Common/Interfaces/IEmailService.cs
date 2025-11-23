namespace RestaurantManagment.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
    Task SendEmailVerificationAsync(string to, string userName, string verificationLink);
    Task SendJobApplicationStatusEmailAsync(string applicantEmail, string applicantName, string jobTitle, string restaurantName, string status, string? notes = null);
    Task SendNewJobApplicationNotificationAsync(string ownerEmail, string ownerName, string applicantName, string jobTitle, string restaurantName);
    Task SendPasswordResetAsync(string to, string userName, string resetLink);
    Task SendAccountDeletionConfirmationAsync(string to, string userName, string confirmationLink);
    Task SendOrderConfirmationEmailAsync(string to, string customerName, string orderId, string restaurantName, decimal totalAmount, string deliveryAddress, List<(string itemName, int quantity, decimal price)> items);
    
   
    Task SendOrderStatusUpdateEmailAsync(string to, string customerName, string orderId, string restaurantName, string status, string? estimatedDeliveryTime = null);
    Task SendOrderCancelledEmailAsync(string to, string customerName, string orderId, string restaurantName, string? reason = null);
    
   
    Task SendReservationConfirmationEmailAsync(string to, string customerName, string reservationId, string restaurantName, DateTime reservationDate, int numberOfGuests, string tableInfo);
    Task SendReservationStatusUpdateEmailAsync(string to, string customerName, string reservationId, string restaurantName, DateTime reservationDate, string status, string? notes = null);
    Task SendReservationCancelledEmailAsync(string to, string customerName, string reservationId, string restaurantName, DateTime reservationDate, string? reason = null);
    Task SendReservationReminderEmailAsync(string to, string customerName, string restaurantName, DateTime reservationDate, int numberOfGuests, string tableInfo);
    

    Task SendReviewApprovedEmailAsync(string to, string customerName, string restaurantName, int rating);
    Task SendReviewRejectedEmailAsync(string to, string customerName, string restaurantName, string reason);
    Task SendNewReviewNotificationToOwnerAsync(string to, string ownerName, string restaurantName, string customerName, int rating, string comment);
}
