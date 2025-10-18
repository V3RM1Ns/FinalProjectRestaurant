using AutoMapper;
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
            var verificationLink = $"{Request.Scheme}://{Request.Host}/api/Account/verify-email?userId={user.Id}&token={Uri.EscapeDataString(emailToken)}";
            
            // E-posta gönder
            try
            {
                await emailService.SendEmailVerificationAsync(user.Email!, user.UserName!, verificationLink);
            }
            catch (Exception ex)
            {
                // E-posta gönderilemezse kullanıcıyı bilgilendir ama hesap oluşturuldu
                return Ok(new { 
                    Message = "Kayıt başarılı ancak doğrulama e-postası gönderilemedi. Lütfen tekrar deneyin.",
                    UserId = user.Id,
                    EmailSendError = ex.Message
                });
            }
            
            return Ok(new { 
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
                // Frontend'e yönlendirme
                return Redirect($"{Request.Scheme}://{Request.Host.Host}:3000/email-verified?status=already-verified");
            }

            var result = await userManager.ConfirmEmailAsync(user, token);
            if (result.Succeeded)
            {
                // Frontend'e yönlendirme
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
            var verificationLink = $"{Request.Scheme}://{Request.Host}/api/Account/verify-email?userId={user.Id}&token={Uri.EscapeDataString(emailToken)}";
            
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

            // E-posta doğrulaması kontrolü
            if (!user.EmailConfirmed)
            {
                return Unauthorized(new { 
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

            return Ok(new { 
                Message = "Giriş başarılı",
                Token = token,
                User = new {
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
            catch (Exception)
            {
                
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
    }
}
