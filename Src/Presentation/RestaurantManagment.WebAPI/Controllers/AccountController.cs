using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RestaurantManagment.Application.Common.DTOs.Account;
using RestaurantManagment.Application.Common.Interfaces;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController(
        UserManager<AppUser> userManager,
        IAccountService accountService,
        IFileService fileService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto userRegisterDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

           
            var result = await accountService.RegisterUserAsync(userRegisterDto, string.Empty);
            
            if (!result.Success)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError("", error);
                }
                return BadRequest(ModelState);
            }

          
            if (!string.IsNullOrEmpty(result.UserId))
            {
                var user = await userManager.FindByIdAsync(result.UserId);
                if (user != null)
                {
                    var emailToken = await userManager.GenerateEmailConfirmationTokenAsync(user);
                    var verificationLink = $"{Request.Scheme}://{Request.Host}/api/Account/verify-email?userId={user.Id}&token={Uri.EscapeDataString(emailToken)}";
                    
                  
                    var emailResult = await accountService.ResendVerificationEmailAsync(user.Email!, verificationLink);
                    
                    if (!emailResult.Success)
                    {
                       
                        return Ok(new
                        {
                            Message = result.Message,
                            UserId = result.UserId,
                            Email = result.Email,
                            EmailSendError = emailResult.Message
                        });
                    }
                }
            }

            return Ok(new
            {
                Message = result.Message,
                UserId = result.UserId,
                Email = result.Email
            });
        }

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string userId, [FromQuery] string token)
        {
            var result = await accountService.VerifyEmailAsync(userId, token);
            
            if (!result.Success)
            {
                var status = result.Message == "User not found" ? "not-found" : "failed";
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/email-verified?status={status}");
            }

            var verificationStatus = result.Message == "Email already verified" ? "already-verified" : "success";
            return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/email-verified?status={verificationStatus}");
        }

        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerificationEmail([FromBody] ResendVerificationDto dto)
        {
            var user = await userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            var emailToken = await userManager.GenerateEmailConfirmationTokenAsync(user);
            var verificationLink = $"{Request.Scheme}://{Request.Host}/api/Account/verify-email?userId={user.Id}&token={Uri.EscapeDataString(emailToken)}";

            var result = await accountService.ResendVerificationEmailAsync(dto.Email, verificationLink);

            if (!result.Success)
            {
                return result.Message.Contains("already verified") 
                    ? BadRequest(new { Message = result.Message })
                    : StatusCode(500, new { Message = result.Message });
            }

            return Ok(new { Message = result.Message });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto userLoginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await accountService.LoginAsync(userLoginDto);

            if (!result.Success)
            {
                if (result.RequiresEmailVerification)
                {
                    return Unauthorized(new
                    {
                        Message = result.Message,
                        RequiresEmailVerification = true,
                        result.User
                    });
                }
                return Unauthorized(new { Message = result.Message });
            }

            return Ok(new
            {
                Message = result.Message,
                Token = result.Token,
                User = result.User
            });
        }

        [HttpPost("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto forgotPasswordDto)
        {
            var user = await userManager.FindByEmailAsync(forgotPasswordDto.Email);
            if (user != null)
            {
                var resetToken = await userManager.GeneratePasswordResetTokenAsync(user);
                var frontendUrl = "http://localhost:3000";
                var resetLink = $"{frontendUrl}/reset-password?userId={user.Id}&token={Uri.EscapeDataString(resetToken)}";
                
                var result = await accountService.ForgotPasswordAsync(forgotPasswordDto.Email, resetLink);
                return Ok(new { Message = result.Message });
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

            var result = await accountService.ResetPasswordAsync(resetPasswordDto);

            if (!result.Success)
                return BadRequest(new { Message = result.Message });

            return Ok(new { Message = result.Message });
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

            var result = await accountService.ChangePasswordAsync(currentUser.Id, changePasswordDto);

            if (!result.Success)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError("", error);
                }
                return BadRequest(ModelState);
            }

            return Ok(new { Message = result.Message });
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

            var result = await accountService.GetUserProfileAsync(currentUser.Id);

            if (!result.Success)
                return Unauthorized(new { Message = result.Message });

            return Ok(result.Profile);
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

            string? verificationLink = null;
            if (!string.IsNullOrWhiteSpace(userProfileDto.Email) && 
                !string.Equals(currentUser.Email, userProfileDto.Email, StringComparison.OrdinalIgnoreCase))
            {
                var emailToken = await userManager.GenerateEmailConfirmationTokenAsync(currentUser);
                verificationLink = $"{Request.Scheme}://{Request.Host}/api/Account/verify-email?userId={currentUser.Id}&token={Uri.EscapeDataString(emailToken)}";
            }

            var result = await accountService.UpdateUserProfileAsync(currentUser.Id, userProfileDto, verificationLink);

            if (!result.Success)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError("", error);
                }
                return BadRequest(ModelState);
            }

            if (result.Errors.Any())
            {
                return Ok(new
                {
                    Message = result.Message,
                    Error = string.Join(", ", result.Errors)
                });
            }

            return Ok(new { Message = result.Message });
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

            var result = await accountService.RequestAccountDeletionAsync(currentUser.Id, deletionLink);

            if (!result.Success)
                return StatusCode(500, new { Message = result.Message });

            return Ok(new { Message = result.Message });
        }

        [HttpGet("confirm-account-deletion")]
        public async Task<IActionResult> ConfirmAccountDeletion([FromQuery] string userId, [FromQuery] string token)
        {
            var result = await accountService.ConfirmAccountDeletionAsync(userId, token);

            var status = result.Success ? "success" : 
                        result.Message == "User not found" ? "not-found" :
                        result.Message == "Invalid deletion link" ? "invalid" :
                        result.Message == "Invalid or expired token" ? "invalid-token" : "failed";

            return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-deleted?status={status}");
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await accountService.LogoutAsync();
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

            var result = await accountService.ApplyForRestaurantOwnershipAsync(currentUser.Id, applicationDto);

            if (!result.Success)
                return BadRequest(new { Message = result.Message });

            return Ok(new { Message = result.Message });
        }

        /// <summary>
        /// Upload profile image (Optional for all users)
        /// </summary>
        [HttpPost("profile/upload-image")]
        [Authorize]
        public async Task<IActionResult> UploadProfileImage([FromForm] IFormFile file)
        {
            var currentUser = await userManager.GetUserAsync(User);
            if (currentUser == null)
                return Unauthorized(new { Message = "User not found" });

            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { Message = "Profil resmi seçilmedi." });

                var fileUrl = await fileService.UploadProfileImageAsync(file, currentUser.Id);
                return Ok(new { imageUrl = fileUrl, message = "Profil resmi başarıyla yüklendi." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Profil resmi yüklenirken bir hata oluştu.", error = ex.Message });
            }
        }
    }
}
