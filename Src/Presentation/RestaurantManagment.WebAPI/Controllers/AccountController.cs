using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RestaurantManagment.Application.Common.DTOs.Account;
using RestaurantManagment.Domain.Models;
using RestaurantManagment.Infrastructure.Services;

namespace RestaurantManagment.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        RoleManager<IdentityRole> roleManager,
        IMapper mapper,
        IJwtTokenService jwtTokenService) : Controller
    {
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto userRegisterDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            
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
            
            var token = await jwtTokenService.GenerateTokenAsync(user);
            
            return Ok(new { 
                Message = "User registered successfully",
                Token = token,
                User = new {
                    user.Id,
                    user.UserName,
                    user.Email,
                }
            });
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

            var result = await signInManager.CheckPasswordSignInAsync(user, userLoginDto.Password, false);
            if (!result.Succeeded)
            {
                return Unauthorized(new { Message = "Invalid email or password" });
            }

            var token = await jwtTokenService.GenerateTokenAsync(user);
            var roles = await userManager.GetRolesAsync(user);

            return Ok(new { 
                Message = "Login successful",
                Token = token,
                User = new {
                    user.Id,
                    user.UserName,
                    user.Email,
                    Roles = roles
                }
            });
        }
    }
}
