using RestaurantManagment.Application.Common.DTOs.Account;
using RestaurantManagment.Domain.Models;
using Microsoft.AspNetCore.Identity;

namespace RestaurantManagment.Application.Common.Interfaces;

public interface IAccountService
{
    Task CreateApplicationAsync(OwnershipApplication application);
    

    Task<(bool Success, string Message, string? UserId, string? Email, IEnumerable<string> Errors)> RegisterUserAsync(UserRegisterDto userRegisterDto, string verificationLink);
    
    Task<(bool Success, string Message)> VerifyEmailAsync(string userId, string token);
    Task<(bool Success, string Message)> ResendVerificationEmailAsync(string email, string verificationLink);
    
    Task<(bool Success, string Message, string? Token, object? User, bool RequiresEmailVerification)> LoginAsync(UserLoginDto userLoginDto);
    Task LogoutAsync();

    Task<(bool Success, string Message)> ForgotPasswordAsync(string email, string resetLink);
    Task<(bool Success, string Message)> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
    Task<(bool Success, string Message, IEnumerable<string> Errors)> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto);
    
    Task<(bool Success, object? Profile, string Message)> GetUserProfileAsync(string userId);
    Task<(bool Success, string Message, bool EmailChanged, IEnumerable<string> Errors)> UpdateUserProfileAsync(string userId, UserProfileDto userProfileDto, string? verificationLink);
   
    Task<(bool Success, string Message, string? DeletionLink)> RequestAccountDeletionAsync(string userId, string deletionLink);
    Task<(bool Success, string Message)> ConfirmAccountDeletionAsync(string userId, string token);
 
    Task<(bool Success, string Message)> ApplyForRestaurantOwnershipAsync(string userId, OwnershipApplicationDto applicationDto);
}
