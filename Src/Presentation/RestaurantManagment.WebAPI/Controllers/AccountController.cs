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
        IAccountService accountService) : Controller
    {
        private readonly IAccountService _accountService = accountService;
        
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto userRegisterDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            
            var existingUserByUsername = await userManager.FindByNameAsync(userRegisterDto.Username);
            if (existingUserByUsername != null)
            {
                ModelState.AddModelError("Username", "Bu kullanıcı adı zaten kullanılıyor");
                return BadRequest(ModelState);
            }
            
            
            var existingUserByEmail = await userManager.FindByEmailAsync(userRegisterDto.Email);
            if (existingUserByEmail != null)
            {
                if (existingUserByEmail.IsDeleted)
                {
                    ModelState.AddModelError("Email", "Bu e-posta adresi silinmiş bir hesaba ait. Lütfen farklı bir e-posta kullanın veya destek ile iletişime geçin,Veya hesabınızı geri yükleyin.");
                    return BadRequest(ModelState);
                }
                ModelState.AddModelError("Email", "Bu e-posta adresi zaten kullanılıyor");
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
                    Message = "Kayıt başarılı ancak doğrulama e-postası gönderilemedi. Lütfen tekrar deneyin.",
                    UserId = user.Id,
                    EmailSendError = ex.Message
                });
            }

            return Ok(new
            {
                Message = "Kayıt başarılı! Lütfen e-posta adresinizi kontrol edin ve hesabınızı doğrulayın.",
                UserId = user.Id,
                Email = user.Email
            });
        }

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string userId, [FromQuery] string token)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
            {
                return BadRequest(new { Message = "Geçersiz doğrulama linki" });
            }

            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { Message = "Kullanıcı bulunamadı" });
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
                return NotFound(new { Message = "Kullanıcı bulunamadı" });
            }

            if (user.EmailConfirmed)
            {
                return BadRequest(new { Message = "E-posta adresi zaten doğrulanmış" });
            }

            var emailToken = await userManager.GenerateEmailConfirmationTokenAsync(user);
            var verificationLink =
                $"{Request.Scheme}://{Request.Host}/api/Account/verify-email?userId={user.Id}&token={Uri.EscapeDataString(emailToken)}";

            try
            {
                await emailService.SendEmailVerificationAsync(user.Email!, user.UserName!, verificationLink);
                return Ok(new { Message = "Doğrulama e-postası tekrar gönderildi" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "E-posta gönderilemedi", Error = ex.Message });
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
                return Unauthorized(new { Message = "Geçersiz e-posta veya şifre" });
            }
            


            if (!user.EmailConfirmed)
            {
                return Unauthorized(new
                {
                    Message = "Lütfen önce e-posta adresinizi doğrulayın",
                    RequiresEmailVerification = true,
                    Email = user.Email
                });
            }

            var result = await signInManager.CheckPasswordSignInAsync(user, userLoginDto.Password, false);
            if (!result.Succeeded)
            {
                return Unauthorized(new { Message = "Geçersiz e-posta veya şifre" });
            }

            var token = await jwtTokenService.GenerateTokenAsync(user);
            var roles = await userManager.GetRolesAsync(user);

            return Ok(new
            {
                Message = "Giriş başarılı",
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
                    Message =
                        "Eğer bu e-posta adresine kayıtlı bir hesap varsa, şifre sıfırlama talimatları gönderildi."
                });
            }

            var resetToken = await userManager.GeneratePasswordResetTokenAsync(user);

            // Frontend URL'ini kullan
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
                Message =
                    "Eğer bu e-posta adresine kayıtlı bir hesap varsa, şifre sıfırlama talimatları gönderildi."
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
                return BadRequest(new { Message = "Geçersiz kullanıcı" });
            }

            var isSamePassword = await userManager.CheckPasswordAsync(user, resetPasswordDto.Password);
            if (isSamePassword)
            {
                return BadRequest(new { Message = "Yeni şifre eskisiyle aynı olamaz." });
            }

            var result = await userManager.ResetPasswordAsync(user, resetPasswordDto.Token, resetPasswordDto.Password);
            if (result.Succeeded)
            {
                return Ok(new { Message = "Şifreniz başarıyla sıfırlandı" });
            }

            return BadRequest(new { Message = "Şifre sıfırlama başarısız. Linkin süresi dolmuş olabilir." });
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
                return BadRequest(new { Message = "Mevcut şifreniz yanlış" });
            }

        
            var isSamePassword = await userManager.CheckPasswordAsync(currentUser, changePasswordDto.NewPassword);
            if (isSamePassword)
            {
                return BadRequest(new { Message = "Yeni şifre mevcut şifrenizle aynı olamaz" });
            }

            // Şifreyi değiştir
            var result = await userManager.ChangePasswordAsync(currentUser, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
            if (result.Succeeded)
            {
                return Ok(new { Message = "Şifreniz başarıyla değiştirildi" });
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
                return Unauthorized(new { Message = "Kullanıcı bulunamadı" });
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
                return Unauthorized(new { Message = "Kullanıcı bulunamadı" });
            }

            bool emailChanged = false;

            // İsim / soyisim güncelle
            if (!string.IsNullOrWhiteSpace(userProfileDto.FirstName))
            {
                currentUser.FirstName = userProfileDto.FirstName.Trim();
            }

            if (!string.IsNullOrWhiteSpace(userProfileDto.LastName))
            {
                currentUser.LastName = userProfileDto.LastName.Trim();
            }

            // FullName'i sunucu tarafında birleştir
            currentUser.FullName = $"{currentUser.FirstName} {currentUser.LastName}".Trim();

            // Username değişikliği ve benzersizlik kontrolü
            if (!string.IsNullOrWhiteSpace(userProfileDto.UserName) &&
                !string.Equals(currentUser.UserName, userProfileDto.UserName, StringComparison.OrdinalIgnoreCase))
            {
                var existingByUsername = await userManager.FindByNameAsync(userProfileDto.UserName);
                if (existingByUsername != null && existingByUsername.Id != currentUser.Id)
                {
                    ModelState.AddModelError("UserName", "Bu kullanıcı adı zaten kullanılıyor");
                    return BadRequest(ModelState);
                }

                currentUser.UserName = userProfileDto.UserName;
            }

            // Email değişikliği ve benzersizlik kontrolü
            if (!string.IsNullOrWhiteSpace(userProfileDto.Email) &&
                !string.Equals(currentUser.Email, userProfileDto.Email, StringComparison.OrdinalIgnoreCase))
            {
                var existingByEmail = await userManager.FindByEmailAsync(userProfileDto.Email);
                if (existingByEmail != null && existingByEmail.Id != currentUser.Id)
                {
                    ModelState.AddModelError("Email", "Bu e-posta adresi zaten kullanılıyor");
                    return BadRequest(ModelState);
                }

                currentUser.Email = userProfileDto.Email;
                // E-posta değişince yeniden doğrulama gereksinimi
                currentUser.EmailConfirmed = false;
                emailChanged = true;
            }

            // Telefon ve adres güncelle
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

            // Eğer e-posta değiştiyse doğrulama e-posta
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
                        Message = "Profil güncellendi ancak doğrulama e-postası gönderilemedi.",
                        Error = ex.Message
                    });
                }

                return Ok(new { Message = "Profil güncellendi. Yeni e-posta adresinizi doğrulayın." });
            }

            return Ok(new { Message = "Profil güncellendi." });
        }
        [HttpPost("request-account-deletion")]
        [Authorize]
        public async Task<IActionResult> RequestAccountDeletion()
        {
            var currentUser = await userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized(new { Message = "Kullanıcı bulunamadı" });
            }

            // Token oluştur
            var deletionToken = await userManager.GenerateUserTokenAsync(
                currentUser,
                TokenOptions.DefaultProvider,
                "AccountDeletion");

            // E-posta ile onay linki gönder
            var deletionLink = $"{Request.Scheme}://{Request.Host}/api/Account/confirm-account-deletion?userId={currentUser.Id}&token={Uri.EscapeDataString(deletionToken)}";

            try
            {
                await emailService.SendAccountDeletionConfirmationAsync(
                    currentUser.Email!,
                    currentUser.UserName!,
                    deletionLink);

                return Ok(new { Message = "Hesap silme onayı için e-posta adresinize bir link gönderdik. Lütfen e-postanızı kontrol edin." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "E-posta gönderilemedi", Error = ex.Message });
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

            // Token'ı doğrula
            var isValidToken = await userManager.VerifyUserTokenAsync(
                user,
                TokenOptions.DefaultProvider,
                "AccountDeletion",
                token);

            if (!isValidToken)
            {
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-deleted?status=invalid-token");
            }

            // Hesabı sil (soft delete)
            user.IsDeleted = true;
            var result = await userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-deleted?status=success");
            }

            return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-deleted?status=failed");
        }

        [HttpPost("delete-account")]
        [Authorize]
        public async Task<IActionResult> DeleteAccount()
        {
            // Bu endpoint artık kullanılmıyor, yeni endpoint: request-account-deletion
            return BadRequest(new { Message = "Bu endpoint kullanım dışı. Lütfen 'request-account-deletion' kullanın." });
        }


        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await signInManager.SignOutAsync();
            return Ok(new { Message = "Çıkış başarılı" });
        }
        [HttpPost("restaurant-ownership-application")]
        [Authorize]
        public async Task<IActionResult> ApplyForRestaurantOwnership([FromBody] OwnershipApplicationDto applicationDto)
        {
            var currentUser = await userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized(new { Message = "Kullanıcı bulunamadı" });
            }

            // Kullanıcının bekleyen bir başvurusu var mı kontrol et
            var hasPendingApplication = userManager.Users
                .Where(u => u.Id == currentUser.Id)
                .SelectMany(u => u.OwnershipApplications)
                .Any(a => a.Status == ApplicationStatus.Pending);

            if (hasPendingApplication)
            {
                return BadRequest(new { Message = "Zaten bekleyen bir başvurunuz var." });
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

            return Ok(new { Message = "Restoran sahipliği başvurunuz alındı ve incelenecektir." });
        }
       
    }
}
