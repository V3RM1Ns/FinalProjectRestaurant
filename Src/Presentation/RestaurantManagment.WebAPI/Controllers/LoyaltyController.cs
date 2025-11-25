using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantManagment.Application.Common.DTOs.Loyalty;
using RestaurantManagment.Application.Common.Interfaces;
using System.Security.Claims;

namespace RestaurantManagment.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class LoyaltyController : ControllerBase
{
    private readonly ILoyaltyService _loyaltyService;

    public LoyaltyController(ILoyaltyService loyaltyService)
    {
        _loyaltyService = loyaltyService;
    }

    [HttpPost("admin/codes")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GenerateLoyaltyCode([FromBody] CreateLoyaltyCodeDto dto)
    {
        try
        {
            var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminId))
                return Unauthorized();

            var code = await _loyaltyService.GenerateLoyaltyCodeAsync(dto, adminId);
            return Ok(code);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("admin/codes")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllLoyaltyCodes()
    {
        try
        {
            var codes = await _loyaltyService.GetAllLoyaltyCodesAsync();
            return Ok(codes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("admin/codes/{codeId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetLoyaltyCodeById(string codeId)
    {
        try
        {
            var code = await _loyaltyService.GetLoyaltyCodeByIdAsync(codeId);
            if (code == null)
                return NotFound(new { message = "Code not found" });

            return Ok(code);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPatch("admin/codes/{codeId}/deactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeactivateLoyaltyCode(string codeId)
    {
        try
        {
            var result = await _loyaltyService.DeactivateLoyaltyCodeAsync(codeId);
            if (!result)
                return NotFound(new { message = "Code not found" });

            return Ok(new { message = "Code deactivated successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("customer/redeem-code")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> RedeemLoyaltyCode([FromBody] RedeemLoyaltyCodeDto dto)
    {
        try
        {
            var customerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();

            var point = await _loyaltyService.RedeemLoyaltyCodeAsync(dto.Code, customerId);
            return Ok(point);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("customer/balance")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetCustomerLoyaltyBalance()
    {
        try
        {
            var customerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();

            var balance = await _loyaltyService.GetCustomerLoyaltyBalanceAsync(customerId);
            return Ok(balance);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("customer/history")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetCustomerPointHistory([FromQuery] string? restaurantId = null)
    {
        try
        {
            var customerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();

            var history = await _loyaltyService.GetCustomerPointHistoryAsync(customerId, restaurantId);
            return Ok(history);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost("owner/rewards")]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> CreateReward([FromBody] CreateRewardDto dto)
    {
        try
        {
            var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized();

            var reward = await _loyaltyService.CreateRewardAsync(dto, ownerId);
            return Ok(reward);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("owner/rewards/{rewardId}")]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> UpdateReward(string rewardId, [FromBody] UpdateRewardDto dto)
    {
        try
        {
            var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized();

            var reward = await _loyaltyService.UpdateRewardAsync(rewardId, dto, ownerId);
            return Ok(reward);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("owner/rewards/{rewardId}")]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> DeleteReward(string rewardId)
    {
        try
        {
            var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized();

            var result = await _loyaltyService.DeleteRewardAsync(rewardId, ownerId);
            if (!result)
                return NotFound(new { message = "Reward not found" });

            return Ok(new { message = "Reward deleted successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/rewards")]
    public async Task<IActionResult> GetRestaurantRewards(string restaurantId)
    {
        try
        {
            var customerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var rewards = await _loyaltyService.GetRestaurantRewardsAsync(restaurantId, customerId);
            return Ok(rewards);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("rewards/{rewardId}")]
    public async Task<IActionResult> GetRewardById(string rewardId)
    {
        try
        {
            var customerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var reward = await _loyaltyService.GetRewardByIdAsync(rewardId, customerId);
            if (reward == null)
                return NotFound(new { message = "Reward not found" });

            return Ok(reward);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost("customer/redeem-reward")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> RedeemReward([FromBody] RedeemRewardDto dto)
    {
        try
        {
            var customerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();

            var redemption = await _loyaltyService.RedeemRewardAsync(dto.RewardId, customerId);
            return Ok(redemption);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("customer/redemptions")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetCustomerRedemptions()
    {
        try
        {
            var customerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();

            var redemptions = await _loyaltyService.GetCustomerRedemptionsAsync(customerId);
            return Ok(redemptions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("customer/redemptions/{redemptionId}")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetRedemptionById(string redemptionId)
    {
        try
        {
            var customerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();

            var redemption = await _loyaltyService.GetRedemptionByIdAsync(redemptionId, customerId);
            if (redemption == null)
                return NotFound(new { message = "Redemption not found" });

            return Ok(redemption);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}

