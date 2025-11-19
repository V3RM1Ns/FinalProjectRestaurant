using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RestaurantManagment.Application.Common.DTOs.Account;
using RestaurantManagment.Application.Common.Interfaces;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Infrastructure.Services;

public class AccountService(
    IAppDbContext _context,
    UserManager<AppUser> _userManager,
    IMapper _mapper,
    IEmailService _emailService,
    IJwtTokenService _jwtTokenService) : IAccountService
{
    public async Task CreateApplicationAsync(OwnershipApplication application)
    {
        _context.OwnershipApplications.Add(application);
        await _context.SaveChangesAsync();
    }

    public async Task<(bool Success, string Message, string? UserId, string? Email, IEnumerable<string> Errors)> RegisterUserAsync(
        UserRegisterDto userRegisterDto, string verificationLink)
    {
        var errors = new List<string>();

        var existingUserByUsername = await _userManager.FindByNameAsync(userRegisterDto.Username);
        if (existingUserByUsername != null)
        {
            errors.Add("This username is already in use");
            return (false, "Registration failed", null, null, errors);
        }
        
        var existingUserByEmail = await _userManager.FindByEmailAsync(userRegisterDto.Email);
        if (existingUserByEmail != null)
        {
            if (existingUserByEmail.IsDeleted)
            {
                errors.Add("This email address belongs to a deleted account. Please use a different email or contact support.");
                return (false, "Registration failed", null, null, errors);
            }
            errors.Add("This email address is already in use");
            return (false, "Registration failed", null, null, errors);
        }

        var user = _mapper.Map<AppUser>(userRegisterDto);

        var result = await _userManager.CreateAsync(user, userRegisterDto.Password);
        if (!result.Succeeded)
        {
            errors.AddRange(result.Errors.Select(e => e.Description));
            return (false, "Registration failed", null, null, errors);
        }

        await _userManager.AddToRoleAsync(user, "Customer");
        
        return (true, "Registration successful! Please check your email and verify your account.", user.Id, user.Email, errors);
    }

    public async Task<(bool Success, string Message)> VerifyEmailAsync(string userId, string token)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
        {
            return (false, "Invalid verification link");
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return (false, "User not found");
        }

        if (user.EmailConfirmed)
        {
            return (true, "Email already verified");
        }

        var result = await _userManager.ConfirmEmailAsync(user, token);
        if (result.Succeeded)
        {
            return (true, "Email verified successfully");
        }

        return (false, "Email verification failed");
    }

    public async Task<(bool Success, string Message)> ResendVerificationEmailAsync(string email, string verificationLink)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return (false, "User not found");
        }

        if (user.EmailConfirmed)
        {
            return (false, "Email address is already verified");
        }

        try
        {
            await _emailService.SendEmailVerificationAsync(user.Email!, user.UserName!, verificationLink);
            return (true, "Verification email has been resent");
        }
        catch (Exception ex)
        {
            return (false, $"Email could not be sent: {ex.Message}");
        }
    }

    public async Task<(bool Success, string Message, string? Token, object? User, bool RequiresEmailVerification)> LoginAsync(
        UserLoginDto userLoginDto)
    {
        var user = await _userManager.FindByEmailAsync(userLoginDto.Email);
        if (user == null)
        {
            return (false, "Invalid email or password", null, null, false);
        }

        if (!user.EmailConfirmed)
        {
            return (false, "Please verify your email address first", null, 
                new { user.Email }, true);
        }
        
        var isPasswordValid = await _userManager.CheckPasswordAsync(user, userLoginDto.Password);
        if (!isPasswordValid)
        {
            return (false, "Invalid email or password", null, null, false);
        }

        var token = await _jwtTokenService.GenerateTokenAsync(user);
        var roles = await _userManager.GetRolesAsync(user);

        var userInfo = new
        {
            user.Id,
            user.UserName,
            user.Email,
            Roles = roles
        };

        return (true, "Login successful", token, userInfo, false);
    }

    public Task LogoutAsync()
    {
        return Task.CompletedTask;
    }

    public async Task<(bool Success, string Message)> ForgotPasswordAsync(string email, string resetLink)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null || !(await _userManager.IsEmailConfirmedAsync(user)))
        {
            return (true, "If an account is registered with this email address, password reset instructions have been sent.");
        }

        try
        {
            await _emailService.SendPasswordResetAsync(user.Email!, user.UserName!, resetLink);
        }
        catch (Exception)
        {
          
        }

        return (true, "If an account is registered with this email address, password reset instructions have been sent.");
    }

    public async Task<(bool Success, string Message)> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
    {
        var user = await _userManager.FindByIdAsync(resetPasswordDto.UserId);
        if (user == null)
        {
            return (false, "Invalid user");
        }

        var isSamePassword = await _userManager.CheckPasswordAsync(user, resetPasswordDto.Password);
        if (isSamePassword)
        {
            return (false, "New password cannot be the same as the old one.");
        }

        var result = await _userManager.ResetPasswordAsync(user, resetPasswordDto.Token, resetPasswordDto.Password);
        if (result.Succeeded)
        {
            return (true, "Your password has been reset successfully");
        }

        return (false, "Password reset failed. The link may have expired.");
    }

    public async Task<(bool Success, string Message, IEnumerable<string> Errors)> ChangePasswordAsync(
        string userId, ChangePasswordDto changePasswordDto)
    {
        var errors = new List<string>();
        
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            errors.Add("User not found");
            return (false, "User not found", errors);
        }

        var isCurrentPasswordCorrect = await _userManager.CheckPasswordAsync(user, changePasswordDto.CurrentPassword);
        if (!isCurrentPasswordCorrect)
        {
            errors.Add("Your current password is incorrect");
            return (false, "Current password is incorrect", errors);
        }

        var isSamePassword = await _userManager.CheckPasswordAsync(user, changePasswordDto.NewPassword);
        if (isSamePassword)
        {
            errors.Add("New password cannot be the same as your current password");
            return (false, "New password cannot be the same", errors);
        }

        var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
        if (result.Succeeded)
        {
            return (true, "Your password has been changed successfully", errors);
        }

        errors.AddRange(result.Errors.Select(e => e.Description));
        return (false, "Password change failed", errors);
    }

    public async Task<(bool Success, object? Profile, string Message)> GetUserProfileAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return (false, null, "User not found");
        }

        var roles = await _userManager.GetRolesAsync(user);

        var profile = new
        {
            user.Id,
            user.FirstName,
            user.LastName,
            user.FullName,
            user.UserName,
            user.Email,
            user.EmailConfirmed,
            user.Phone,
            user.Address,
            Roles = roles
        };

        return (true, profile, "Profile retrieved successfully");
    }

    public async Task<(bool Success, string Message, bool EmailChanged, IEnumerable<string> Errors)> UpdateUserProfileAsync(
        string userId, UserProfileDto userProfileDto, string? verificationLink)
    {
        var errors = new List<string>();
        var user = await _userManager.FindByIdAsync(userId);
        
        if (user == null)
        {
            errors.Add("User not found");
            return (false, "User not found", false, errors);
        }

        bool emailChanged = false;
        
        if (!string.IsNullOrWhiteSpace(userProfileDto.FirstName))
        {
            user.FirstName = userProfileDto.FirstName.Trim();
        }

        if (!string.IsNullOrWhiteSpace(userProfileDto.LastName))
        {
            user.LastName = userProfileDto.LastName.Trim();
        }

        user.FullName = $"{user.FirstName} {user.LastName}".Trim();
        
        if (!string.IsNullOrWhiteSpace(userProfileDto.UserName) &&
            !string.Equals(user.UserName, userProfileDto.UserName, StringComparison.OrdinalIgnoreCase))
        {
            var existingByUsername = await _userManager.FindByNameAsync(userProfileDto.UserName);
            if (existingByUsername != null && existingByUsername.Id != user.Id)
            {
                errors.Add("This username is already in use");
                return (false, "Username is already in use", false, errors);
            }

            user.UserName = userProfileDto.UserName;
        }
        
        if (!string.IsNullOrWhiteSpace(userProfileDto.Email) &&
            !string.Equals(user.Email, userProfileDto.Email, StringComparison.OrdinalIgnoreCase))
        {
            var existingByEmail = await _userManager.FindByEmailAsync(userProfileDto.Email);
            if (existingByEmail != null && existingByEmail.Id != user.Id)
            {
                errors.Add("This email address is already in use");
                return (false, "Email is already in use", false, errors);
            }

            user.Email = userProfileDto.Email;
            user.EmailConfirmed = false;
            emailChanged = true;
        }

        user.Phone = userProfileDto.Phone ?? user.Phone;
        user.Address = userProfileDto.Address ?? user.Address;

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            errors.AddRange(updateResult.Errors.Select(e => e.Description));
            return (false, "Profile update failed", false, errors);
        }
        
        if (emailChanged && !string.IsNullOrEmpty(verificationLink))
        {
            try
            {
                await _emailService.SendEmailVerificationAsync(user.Email!, user.UserName!, verificationLink);
            }
            catch (Exception ex)
            {
                return (true, "Profile updated but verification email could not be sent.", true, new[] { ex.Message });
            }
        }

        return (true, emailChanged ? "Profile updated. Please verify your new email address." : "Profile updated.", emailChanged, errors);
    }

    public async Task<(bool Success, string Message, string? DeletionLink)> RequestAccountDeletionAsync(
        string userId, string deletionLink)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return (false, "User not found", null);
        }

        try
        {
            await _emailService.SendAccountDeletionConfirmationAsync(
                user.Email!,
                user.UserName!,
                deletionLink);

            return (true, "We have sent a confirmation link to your email address for account deletion.", deletionLink);
        }
        catch (Exception ex)
        {
            return (false, $"Email could not be sent: {ex.Message}", null);
        }
    }

    public async Task<(bool Success, string Message)> ConfirmAccountDeletionAsync(string userId, string token)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
        {
            return (false, "Invalid deletion link");
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return (false, "User not found");
        }

        var isValidToken = await _userManager.VerifyUserTokenAsync(
            user,
            TokenOptions.DefaultProvider,
            "AccountDeletion",
            token);

        if (!isValidToken)
        {
            return (false, "Invalid or expired token");
        }

        user.IsDeleted = true;
        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            return (true, "Account deleted successfully");
        }

        return (false, "Account deletion failed");
    }

    public async Task<(bool Success, string Message)> ApplyForRestaurantOwnershipAsync(
        string userId, OwnershipApplicationDto applicationDto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return (false, "User not found");
        }

        var hasPendingApplication = await _context.OwnershipApplications
            .AnyAsync(a => a.UserId == userId && a.Status == ApplicationStatus.Pending);

        if (hasPendingApplication)
        {
            return (false, "You already have a pending application.");
        }

        var application = new OwnershipApplication
        {
            UserId = userId,
            BusinessName = applicationDto.BusinessName,
            BusinessDescription = applicationDto.BusinessDescription,
            BusinessAddress = applicationDto.BusinessAddress,
            BusinessPhone = applicationDto.BusinessPhone,
            BusinessEmail = applicationDto.BusinessEmail,
            Category = applicationDto.Category,
            AdditionalNotes = applicationDto.AdditionalNotes,
            ApplicationDate = DateTime.UtcNow,
            Status = ApplicationStatus.Pending
        };

        await CreateApplicationAsync(application);

        return (true, "Your restaurant ownership application has been received and will be reviewed.");
    }
}
