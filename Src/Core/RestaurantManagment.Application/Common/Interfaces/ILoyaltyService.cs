using RestaurantManagment.Application.Common.DTOs.Loyalty;

namespace RestaurantManagment.Application.Common.Interfaces;

public interface ILoyaltyService
{
    // Admin - Loyalty Code Management
    Task<LoyaltyCodeResponseDto> GenerateLoyaltyCodeAsync(CreateLoyaltyCodeDto dto, string adminId);
    Task<List<LoyaltyCodeDto>> GetAllLoyaltyCodesAsync();
    Task<LoyaltyCodeDto?> GetLoyaltyCodeByIdAsync(string codeId);
    Task<bool> DeactivateLoyaltyCodeAsync(string codeId);

    // Customer - Redeem Loyalty Code
    Task<LoyaltyPointDto> RedeemLoyaltyCodeAsync(string code, string customerId);
    Task<List<CustomerLoyaltyBalanceDto>> GetCustomerLoyaltyBalanceAsync(string customerId);
    Task<List<LoyaltyPointDto>> GetCustomerPointHistoryAsync(string customerId, string? restaurantId = null);

    // Owner - Reward Management
    Task<RewardDto> CreateRewardAsync(CreateRewardDto dto, string ownerId);
    Task<RewardDto> UpdateRewardAsync(string rewardId, UpdateRewardDto dto, string ownerId);
    Task<bool> DeleteRewardAsync(string rewardId, string ownerId);
    Task<List<RewardDto>> GetRestaurantRewardsAsync(string restaurantId, string? customerId = null);
    Task<RewardDto?> GetRewardByIdAsync(string rewardId, string? customerId = null);

    // Customer - Reward Redemption
    Task<RewardRedemptionDto> RedeemRewardAsync(string rewardId, string customerId);
    Task<List<RewardRedemptionDto>> GetCustomerRedemptionsAsync(string customerId);
    Task<RewardRedemptionDto?> GetRedemptionByIdAsync(string redemptionId, string customerId);
}

