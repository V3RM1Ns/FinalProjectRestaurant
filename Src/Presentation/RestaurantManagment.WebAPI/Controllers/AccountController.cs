using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RestaurantManagment.Application.Common.DTOs.Account;
using RestaurantManagment.Application.Common.Interfaces;
using RestaurantManagment.Domain.Models;
using RestaurantManagment.Infrastructure.Services;

namespace RestaurantManagment.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        IMapper mapper,
        IEmailService emailService,
        IJwtTokenService jwtTokenService,
        IAccountService _accountService) : Controller
    {
 
        
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto userRegisterDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            
            var existingUserByUsername = await userManager.FindByNameAsync(userRegisterDto.Username);
            if (existingUserByUsername != null)
            {
                ModelState.AddModelError("Username", "This username is already in use");
                return BadRequest(ModelState);
            }
            
            
            var existingUserByEmail = await userManager.FindByEmailAsync(userRegisterDto.Email);
            if (existingUserByEmail != null)
            {
                if (existingUserByEmail.IsDeleted)
                {
                    ModelState.AddModelError("Email", "This email address belongs to a deleted account. Please use a different email or contact support, or restore your account.");
                    return BadRequest(ModelState);
                }
                ModelState.AddModelError("Email", "This email address is already in use");
                return BadRequest(ModelState);
            }

            var user = mapper.Map<AppUser>(userRegisterDto);

            var result = await userManager.CreateAsync(user, userRegisterDto.Password);
            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }

                return BadRequest(ModelState);
            }

            await userManager.AddToRoleAsync(user, "Customer");

           
            var emailToken = await userManager.GenerateEmailConfirmationTokenAsync(user);

            
            var verificationLink =
                $"{Request.Scheme}://{Request.Host}/api/Account/verify-email?userId={user.Id}&token={Uri.EscapeDataString(emailToken)}";

            try
            {
                await emailService.SendEmailVerificationAsync(user.Email!, user.UserName!, verificationLink);
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    Message = "Registration successful but verification email could not be sent. Please try again.",
                    UserId = user.Id,
                    EmailSendError = ex.Message
                });
            }

            return Ok(new
            {
                Message = "Registration successful! Please check your email and verify your account.",
                UserId = user.Id,
                Email = user.Email
            });
        }

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string userId, [FromQuery] string token)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
            {
                return BadRequest(new { Message = "Invalid verification link" });
            }

            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            if (user.EmailConfirmed)
            {
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/email-verified?status=already-verified");
            }

            var result = await userManager.ConfirmEmailAsync(user, token);
            if (result.Succeeded)
            {
              
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/email-verified?status=success");
            }
            else
            {
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/email-verified?status=failed");
            }
        }

        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerificationEmail([FromBody] ResendVerificationDto dto)
        {
            var user = await userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            if (user.EmailConfirmed)
            {
                return BadRequest(new { Message = "Email address is already verified" });
            }

            var emailToken = await userManager.GenerateEmailConfirmationTokenAsync(user);
            var verificationLink =
                $"{Request.Scheme}://{Request.Host}/api/Account/verify-email?userId={user.Id}&token={Uri.EscapeDataString(emailToken)}";

            try
            {
                await emailService.SendEmailVerificationAsync(user.Email!, user.UserName!, verificationLink);
                return Ok(new { Message = "Verification email has been resent" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Email could not be sent", Error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto userLoginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await userManager.FindByEmailAsync(userLoginDto.Email);
            if (user == null)
            {
                return Unauthorized(new { Message = "Invalid email or password" });
            }

            if (!user.EmailConfirmed)
            {
                return Unauthorized(new
                {
                    Message = "Please verify your email address first",
                    RequiresEmailVerification = true,
                    Email = user.Email
                });
            }

            var result = await signInManager.CheckPasswordSignInAsync(user, userLoginDto.Password, false);
            if (!result.Succeeded)
            {
                return Unauthorized(new { Message = "Invalid email or password" });
            }

            var token = await jwtTokenService.GenerateTokenAsync(user);
            var roles = await userManager.GetRolesAsync(user);

            return Ok(new
            {
                Message = "Login successful",
                Token = token,
                User = new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    Roles = roles
                }
            });
        }

        [HttpPost("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto forgotPasswordDto)
        {
            var user = await userManager.FindByEmailAsync(forgotPasswordDto.Email);
            if (user == null || !(await userManager.IsEmailConfirmedAsync(user)))
            {
                return Ok(new
                {
                    Message = "If an account is registered with this email address, password reset instructions have been sent."
                });
            }

            var resetToken = await userManager.GeneratePasswordResetTokenAsync(user);

            
            var frontendUrl = "http://localhost:3000";
            var resetLink = $"{frontendUrl}/reset-password?userId={user.Id}&token={Uri.EscapeDataString(resetToken)}";

            try
            {
                await emailService.SendPasswordResetAsync(user.Email!, user.UserName!, resetLink);
            }
            catch (Exception ex)
            {
              
                Console.WriteLine($"Failed to send password reset email: {ex}");
            }

            return Ok(new
            {
                Message = "If an account is registered with this email address, password reset instructions have been sent."
            });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await userManager.FindByIdAsync(resetPasswordDto.UserId);
            if (user == null)
            {
                return BadRequest(new { Message = "Invalid user" });
            }

            var isSamePassword = await userManager.CheckPasswordAsync(user, resetPasswordDto.Password);
            if (isSamePassword)
            {
                return BadRequest(new { Message = "New password cannot be the same as the old one." });
            }

            var result = await userManager.ResetPasswordAsync(user, resetPasswordDto.Token, resetPasswordDto.Password);
            if (result.Succeeded)
            {
                return Ok(new { Message = "Your password has been reset successfully" });
            }

            return BadRequest(new { Message = "Password reset failed. The link may have expired." });
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var currentUser = await userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/login");
            }

       
            var isCurrentPasswordCorrect = await userManager.CheckPasswordAsync(currentUser, changePasswordDto.CurrentPassword);
            if (!isCurrentPasswordCorrect)
            {
                return BadRequest(new { Message = "Your current password is incorrect" });
            }

        
            var isSamePassword = await userManager.CheckPasswordAsync(currentUser, changePasswordDto.NewPassword);
            if (isSamePassword)
            {
                return BadRequest(new { Message = "New password cannot be the same as your current password" });
            }

            
            var result = await userManager.ChangePasswordAsync(currentUser, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
            if (result.Succeeded)
            {
                return Ok(new { Message = "Your password has been changed successfully" });
            }

            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }

            return BadRequest(ModelState);
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetUserProfile()
        {
            var currentUser = await userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized(new { Message = "User not found" });
            }

            var roles = await userManager.GetRolesAsync(currentUser);

            return Ok(new
            {
                currentUser.Id,
                currentUser.FirstName,
                currentUser.LastName,
                currentUser.FullName,
                currentUser.UserName,
                currentUser.Email,
                currentUser.EmailConfirmed,
                currentUser.Phone,
                currentUser.Address,
                Roles = roles
            });
        }

        [HttpPost("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateUserProfile(UserProfileDto userProfileDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var currentUser = await userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized(new { Message = "User not found" });
            }

            bool emailChanged = false;

           
            if (!string.IsNullOrWhiteSpace(userProfileDto.FirstName))
            {
                currentUser.FirstName = userProfileDto.FirstName.Trim();
            }

            if (!string.IsNullOrWhiteSpace(userProfileDto.LastName))
            {
                currentUser.LastName = userProfileDto.LastName.Trim();
            }

           
            currentUser.FullName = $"{currentUser.FirstName} {currentUser.LastName}".Trim();

          
            if (!string.IsNullOrWhiteSpace(userProfileDto.UserName) &&
                !string.Equals(currentUser.UserName, userProfileDto.UserName, StringComparison.OrdinalIgnoreCase))
            {
                var existingByUsername = await userManager.FindByNameAsync(userProfileDto.UserName);
                if (existingByUsername != null && existingByUsername.Id != currentUser.Id)
                {
                    ModelState.AddModelError("UserName", "This username is already in use");
                    return BadRequest(ModelState);
                }

                currentUser.UserName = userProfileDto.UserName;
            }

            if (!string.IsNullOrWhiteSpace(userProfileDto.Email) &&
                !string.Equals(currentUser.Email, userProfileDto.Email, StringComparison.OrdinalIgnoreCase))
            {
                var existingByEmail = await userManager.FindByEmailAsync(userProfileDto.Email);
                if (existingByEmail != null && existingByEmail.Id != currentUser.Id)
                {
                    ModelState.AddModelError("Email", "This email address is already in use");
                    return BadRequest(ModelState);
                }

                currentUser.Email = userProfileDto.Email;
             
                currentUser.EmailConfirmed = false;
                emailChanged = true;
            }

   
            currentUser.Phone = userProfileDto.Phone ?? currentUser.Phone;
            currentUser.Address = userProfileDto.Address ?? currentUser.Address;

            var updateResult = await userManager.UpdateAsync(currentUser);
            if (!updateResult.Succeeded)
            {
                foreach (var error in updateResult.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }

                return BadRequest(ModelState);
            }
             
            if (emailChanged)
            {
                try
                {
                    var emailToken = await userManager.GenerateEmailConfirmationTokenAsync(currentUser);
                    var verificationLink =
                        $"{Request.Scheme}://{Request.Host}/api/Account/verify-email?userId={currentUser.Id}&token={Uri.EscapeDataString(emailToken)}";
                    await emailService.SendEmailVerificationAsync(currentUser.Email!, currentUser.UserName!,
                        verificationLink);
                }
                catch (Exception ex)
                {
                    return Ok(new
                    {
                        Message = "Profile updated but verification email could not be sent.",
                        Error = ex.Message
                    });
                }

                return Ok(new { Message = "Profile updated. Please verify your new email address." });
            }

            return Ok(new { Message = "Profile updated." });
        }

        [HttpPost("request-account-deletion")]
        [Authorize]
        public async Task<IActionResult> RequestAccountDeletion()
        {
            var currentUser = await userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized(new { Message = "User not found" });
            }

          
            var deletionToken = await userManager.GenerateUserTokenAsync(
                currentUser,
                TokenOptions.DefaultProvider,
                "AccountDeletion");

           
            var deletionLink = $"{Request.Scheme}://{Request.Host}/api/Account/confirm-account-deletion?userId={currentUser.Id}&token={Uri.EscapeDataString(deletionToken)}";

            try
            {
                await emailService.SendAccountDeletionConfirmationAsync(
                    currentUser.Email!,
                    currentUser.UserName!,
                    deletionLink);

                return Ok(new { Message = "We have sent a confirmation link to your email address for account deletion. Please check your email." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Email could not be sent", Error = ex.Message });
            }
        }

        [HttpGet("confirm-account-deletion")]
        public async Task<IActionResult> ConfirmAccountDeletion([FromQuery] string userId, [FromQuery] string token)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
            {
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-deleted?status=invalid");
            }

            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-deleted?status=not-found");
            }

       
            var isValidToken = await userManager.VerifyUserTokenAsync(
                user,
                TokenOptions.DefaultProvider,
                "AccountDeletion",
                token);

            if (!isValidToken)
            {
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-deleted?status=invalid-token");
            }

            user.IsDeleted = true;
            var result = await userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-deleted?status=success");
            }

            return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-deleted?status=failed");
        }

      


        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await signInManager.SignOutAsync();
            return Ok(new { Message = "Logout successful" });
        }
        [HttpPost("restaurant-ownership-application")]
        [Authorize]
        public async Task<IActionResult> ApplyForRestaurantOwnership([FromBody] OwnershipApplicationDto applicationDto)
        {
            var currentUser = await userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized(new { Message = "User not found" });
            }

            var hasPendingApplication = userManager.Users
                .Where(u => u.Id == currentUser.Id)
                .SelectMany(u => u.OwnershipApplications)
                .Any(a => a.Status == ApplicationStatus.Pending);

            if (hasPendingApplication)
            {
                return BadRequest(new { Message = "You already have a pending application." });
            }

            var application = new OwnershipApplication
            {
                UserId = currentUser.Id,
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

            await _accountService.CreateApplicationAsync(application);

            return Ok(new { Message = "Your restaurant ownership application has been received and will be reviewed." });
        }
    }
}
