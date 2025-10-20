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
        IJwtTokenService jwtTokenService) : Controller
    {
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto userRegisterDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Username kontrolü
            var existingUserByUsername = await userManager.FindByNameAsync(userRegisterDto.Username);
            if (existingUserByUsername != null)
            {
                ModelState.AddModelError("Username", "Bu kullanıcı adı zaten kullanılıyor");
                return BadRequest(ModelState);
            }

            // Email kontrolü
            var existingUserByEmail = await userManager.FindByEmailAsync(userRegisterDto.Email);
            if (existingUserByEmail != null)
            {
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

            // E-posta doğrulama token'ı oluştur
            var emailToken = await userManager.GenerateEmailConfirmationTokenAsync(user);

            // Doğrulama linki oluştur
            var verificationLink =
                $"{Request.Scheme}://{Request.Host}/api/Account/verify-email?userId={user.Id}&token={Uri.EscapeDataString(emailToken)}";

            // E-posta gönder
            try
            {
                await emailService.SendEmailVerificationAsync(user.Email!, user.UserName!, verificationLink);
            }
            catch (Exception ex)
            {
                // E-posta gönderilemezse kullanıcıyı bilgilendir ama hesap oluşturuldu
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
            
            // Soft delete kontrolü
            if (user.IsDeleted)
            {
                // Tekrar aktif etme token'ı oluştur
                var reactivationToken = await userManager.GeneratePasswordResetTokenAsync(user);
                var reactivationLink = $"{Request.Scheme}://{Request.Host}/api/Account/reactivate-account?userId={user.Id}&token={Uri.EscapeDataString(reactivationToken)}";
                
                // Tekrar aktif etme e-postası gönder
                try
                {
                    await emailService.SendAccountReactivationAsync(user.Email!, user.UserName!, reactivationLink);
                }
                catch (Exception)
                {
                    // E-posta gönderilemezse yine de mesaj ver
                }
                
                return Unauthorized(new
                {
                    Message = "Hesabınız devre dışı bırakılmış. Hesabınızı tekrar aktif etmek için e-postanıza gönderilen linke tıklayın.",
                    IsDeleted = true,
                    Email = user.Email
                });
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
                // Log the exception for troubleshooting; do not fail the request
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

        [HttpPost("delete-account")]
        [Authorize]
        public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountRequestDto deleteAccountRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var currentUser = await userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized(new { Message = "Kullanıcı bulunamadı" });
            }

            // Silme türünü kontrol et
            if (deleteAccountRequest.DeleteType.ToLower() != "soft" && deleteAccountRequest.DeleteType.ToLower() != "hard")
            {
                return BadRequest(new { Message = "Geçersiz silme türü. 'soft' veya 'hard' olmalıdır." });
            }

            // Token oluştur (şifre sıfırlama token'ını kullanıyoruz)
            var deleteToken = await userManager.GeneratePasswordResetTokenAsync(currentUser);

            // Onay linki oluştur
            var confirmationLink = $"{Request.Scheme}://{Request.Host}/api/Account/confirm-delete?userId={currentUser.Id}&token={Uri.EscapeDataString(deleteToken)}&deleteType={deleteAccountRequest.DeleteType.ToLower()}";

            try
            {
                await emailService.SendDeleteAccountConfirmationAsync(
                    currentUser.Email!,
                    currentUser.UserName!,
                    confirmationLink,
                    deleteAccountRequest.DeleteType.ToLower()
                );

                return Ok(new { Message = "Hesap silme onayı e-postanıza gönderildi. Lütfen e-postanızı kontrol edin." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "E-posta gönderilemedi", Error = ex.Message });
            }
        }

        [HttpGet("confirm-delete")]
        public async Task<IActionResult> ConfirmDeleteAccount([FromQuery] string userId, [FromQuery] string token, [FromQuery] string deleteType)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token) || string.IsNullOrEmpty(deleteType))
            {
                return BadRequest(new { Message = "Geçersiz onay linki" });
            }

            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { Message = "Kullanıcı bulunamadı" });
            }

            // Token'ı doğrula
            var isValidToken = await userManager.VerifyUserTokenAsync(
                user,
                userManager.Options.Tokens.PasswordResetTokenProvider,
                "ResetPassword",
                token
            );

            if (!isValidToken)
            {
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-deleted?status=invalid-token");
            }

            if (deleteType.ToLower() == "soft")
            {
                // Soft Delete: Hesabı devre dışı bırak
                user.IsDeleted = true;
                user.DeletedAt = DateTime.UtcNow;
                user.DeletedBy = user.Id;
                user.LockoutEnabled = true;
                user.LockoutEnd = DateTimeOffset.MaxValue; // Süresiz kilitle

                var updateResult = await userManager.UpdateAsync(user);
                if (updateResult.Succeeded)
                {
                    // Tekrar aktif etme linki gönder
                    try
                    {
                        var reactivationToken = await userManager.GeneratePasswordResetTokenAsync(user);
                        var reactivationLink = $"{Request.Scheme}://{Request.Host}/api/Account/reactivate-account?userId={user.Id}&token={Uri.EscapeDataString(reactivationToken)}";
                        
                        await emailService.SendAccountReactivationAsync(user.Email!, user.UserName!, reactivationLink);
                    }
                    catch (Exception)
                    {
                        // E-posta gönderilemezse yine de işleme devam et
                    }

                    return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-deleted?status=soft-success");
                }
                else
                {
                    return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-deleted?status=failed");
                }
            }
            else if (deleteType.ToLower() == "hard")
            {
                // Hard Delete: Kullanıcıyı tamamen sil
                var deleteResult = await userManager.DeleteAsync(user);
                if (deleteResult.Succeeded)
                {
                    return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/login?deleteStatus=hard-success");
                }
                else
                {
                    return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-deleted?status=failed");
                }
            }

            return BadRequest(new { Message = "Geçersiz silme türü" });
        }

        [HttpGet("reactivate-account")]
        public async Task<IActionResult> ReactivateAccount([FromQuery] string userId, [FromQuery] string token)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
            {
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-reactivated?status=invalid-token");
            }

            // Kullanıcıyı bul - soft delete edilmiş kullanıcılar dahil
            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                // Log için userId bilgisi ekleyelim
                Console.WriteLine($"Reactivation attempt failed: User not found with ID: {userId}");
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-reactivated?status=user-not-found");
            }

            // Eğer kullanıcı silinmemişse
            if (!user.IsDeleted)
            {
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-reactivated?status=already-active");
            }

            // Token'ı doğrula
            var isValidToken = await userManager.VerifyUserTokenAsync(
                user,
                userManager.Options.Tokens.PasswordResetTokenProvider,
                "ResetPassword",
                token
            );

            if (!isValidToken)
            {
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-reactivated?status=invalid-token");
            }

            // Hesabı tekrar aktif et
            user.IsDeleted = false;
            user.DeletedAt = null;
            user.DeletedBy = null;
            user.LockoutEnabled = false;
            user.LockoutEnd = null;

            var updateResult = await userManager.UpdateAsync(user);
            if (updateResult.Succeeded)
            {
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-reactivated?status=success");
            }
            else
            {
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/account-reactivated?status=failed");
            }
        }
    }
}

