namespace RestaurantManagment.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
    Task SendEmailVerificationAsync(string to, string userName, string verificationLink);
    Task SendJobApplicationStatusEmailAsync(string applicantEmail, string applicantName, string jobTitle, string restaurantName, string status, string? notes = null);
    Task SendNewJobApplicationNotificationAsync(string ownerEmail, string ownerName, string applicantName, string jobTitle, string restaurantName);
    Task SendPasswordResetAsync(string to, string userName, string resetLink);
    Task SendAccountDeletionConfirmationAsync(string to, string userName, string confirmationLink);
}
