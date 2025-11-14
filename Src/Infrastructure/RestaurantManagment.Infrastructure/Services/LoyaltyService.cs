using Microsoft.EntityFrameworkCore;
using RestaurantManagment.Application.Common.DTOs.Loyalty;

using RestaurantManagment.Application.Common.Interfaces;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Infrastructure.Services;

public class LoyaltyService : ILoyaltyService
{
    private readonly IAppDbContext _context;

    public LoyaltyService(IAppDbContext context)
    {
        _context = context;
    }

    // Admin - Generate Loyalty Code
    public async Task<LoyaltyCodeResponseDto> GenerateLoyaltyCodeAsync(CreateLoyaltyCodeDto dto, string adminId)
    {
        var code = GenerateUniqueCode();

        var loyaltyCode = new LoyaltyCode
        {
            Id = Guid.NewGuid().ToString(),
            Code = code,
            PointValue = dto.PointValue,
            Description = dto.Description,
            CreatedByAdminId = adminId,
            MaxUses = dto.MaxUses,
            ExpiryDate = dto.ExpiryDate,
            RestaurantId = dto.RestaurantId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.LoyaltyCodes.Add(loyaltyCode);
        await _context.SaveChangesAsync(CancellationToken.None);

        return new LoyaltyCodeResponseDto
        {
            Code = loyaltyCode.Code,
            PointValue = loyaltyCode.PointValue,
            Description = loyaltyCode.Description,
            ExpiryDate = loyaltyCode.ExpiryDate
        };
    }

    public async Task<List<LoyaltyCodeDto>> GetAllLoyaltyCodesAsync()
    {
        var codes = await _context.LoyaltyCodes
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return codes.Select(c => new LoyaltyCodeDto
        {
            Id = c.Id,
            Code = c.Code,
            PointValue = c.PointValue,
            Description = c.Description,
            IsActive = c.IsActive,
            MaxUses = c.MaxUses,
            CurrentUses = c.CurrentUses,
            CreatedAt = c.CreatedAt,
            ExpiryDate = c.ExpiryDate,
            IsUsed = c.IsUsed,
            UsedByCustomerId = c.UsedByCustomerId,
            UsedAt = c.UsedAt,
            RestaurantId = c.RestaurantId
        }).ToList();
    }

    public async Task<LoyaltyCodeDto?> GetLoyaltyCodeByIdAsync(string codeId)
    {
        var code = await _context.LoyaltyCodes.FindAsync(codeId);
        if (code == null) return null;

        return new LoyaltyCodeDto
        {
            Id = code.Id,
            Code = code.Code,
            PointValue = code.PointValue,
            Description = code.Description,
            IsActive = code.IsActive,
            MaxUses = code.MaxUses,
            CurrentUses = code.CurrentUses,
            CreatedAt = code.CreatedAt,
            ExpiryDate = code.ExpiryDate,
            IsUsed = code.IsUsed,
            UsedByCustomerId = code.UsedByCustomerId,
            UsedAt = code.UsedAt,
            RestaurantId = code.RestaurantId
        };
    }

    public async Task<bool> DeactivateLoyaltyCodeAsync(string codeId)
    {
        var code = await _context.LoyaltyCodes.FindAsync(codeId);
        if (code == null) return false;

        code.IsActive = false;
        await _context.SaveChangesAsync(CancellationToken.None);
        return true;
    }

    // Customer - Redeem Loyalty Code
    public async Task<LoyaltyPointDto> RedeemLoyaltyCodeAsync(string codeString, string customerId)
    {
        var code = await _context.LoyaltyCodes
            .FirstOrDefaultAsync(c => c.Code == codeString);

        if (code == null)
            throw new Exception("Invalid code");

        if (!code.IsActive)
            throw new Exception("This code is no longer active");

        if (code.ExpiryDate.HasValue && code.ExpiryDate.Value < DateTime.UtcNow)
            throw new Exception("This code has expired");

        if (code.MaxUses.HasValue && code.CurrentUses >= code.MaxUses.Value)
            throw new Exception("This code has reached its maximum number of uses");

        if (code.IsUsed && code.MaxUses == 1)
            throw new Exception("This code has already been used");

        // Create loyalty point entry
        var loyaltyPoint = new LoyaltyPoint
        {
            Id = Guid.NewGuid().ToString(),
            CustomerId = customerId,
            RestaurantId = code.RestaurantId ?? string.Empty,
            Points = code.PointValue,
            Description = $"Redeemed code: {code.Code}",
            Type = LoyaltyPointType.Bonus,
            EarnedAt = DateTime.UtcNow,
            ExpiryDate = DateTime.UtcNow.AddYears(1)
        };

        _context.LoyaltyPoints.Add(loyaltyPoint);

        // Update code usage
        code.CurrentUses++;
        if (code.MaxUses == 1)
        {
            code.IsUsed = true;
            code.UsedByCustomerId = customerId;
            code.UsedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(CancellationToken.None);

        var restaurant = await _context.Restaurants.FindAsync(loyaltyPoint.RestaurantId);

        return new LoyaltyPointDto
        {
            Id = loyaltyPoint.Id,
            CustomerId = loyaltyPoint.CustomerId,
            RestaurantId = loyaltyPoint.RestaurantId,
            RestaurantName = restaurant?.Name ?? "General",
            Points = loyaltyPoint.Points,
            Description = loyaltyPoint.Description,
            Type = loyaltyPoint.Type.ToString(),
            EarnedAt = loyaltyPoint.EarnedAt,
            ExpiryDate = loyaltyPoint.ExpiryDate
        };
    }

    public async Task<List<CustomerLoyaltyBalanceDto>> GetCustomerLoyaltyBalanceAsync(string customerId)
    {
        var points = await _context.LoyaltyPoints
            .Where(p => p.CustomerId == customerId)
            .Include(p => p.Restaurant)
            .ToListAsync();

        var grouped = points.GroupBy(p => p.RestaurantId);

        var balances = new List<CustomerLoyaltyBalanceDto>();

        foreach (var group in grouped)
        {
            var restaurant = await _context.Restaurants.FindAsync(group.Key);
            var totalEarned = group.Where(p => p.Type == LoyaltyPointType.Earned || p.Type == LoyaltyPointType.Bonus).Sum(p => p.Points);
            var redeemed = group.Where(p => p.Type == LoyaltyPointType.Redeemed).Sum(p => Math.Abs(p.Points));
            var available = totalEarned - redeemed;

            balances.Add(new CustomerLoyaltyBalanceDto
            {
                CustomerId = customerId,
                RestaurantId = group.Key,
                RestaurantName = restaurant?.Name ?? "General",
                TotalPoints = totalEarned,
                AvailablePoints = available,
                RedeemedPoints = redeemed,
                RecentTransactions = group.OrderByDescending(p => p.EarnedAt).Take(5).Select(p => new LoyaltyPointDto
                {
                    Id = p.Id,
                    CustomerId = p.CustomerId,
                    RestaurantId = p.RestaurantId,
                    RestaurantName = restaurant?.Name ?? "General",
                    Points = p.Points,
                    Description = p.Description,
                    Type = p.Type.ToString(),
                    EarnedAt = p.EarnedAt,
                    ExpiryDate = p.ExpiryDate,
                    IsRedeemed = p.IsRedeemed
                }).ToList()
            });
        }

        return balances;
    }

    public async Task<List<LoyaltyPointDto>> GetCustomerPointHistoryAsync(string customerId, string? restaurantId = null)
    {
        var query = _context.LoyaltyPoints
            .Where(p => p.CustomerId == customerId)
            .Include(p => p.Restaurant)
            .AsQueryable();

        if (!string.IsNullOrEmpty(restaurantId))
            query = query.Where(p => p.RestaurantId == restaurantId);

        var points = await query.OrderByDescending(p => p.EarnedAt).ToListAsync();

        return points.Select(p => new LoyaltyPointDto
        {
            Id = p.Id,
            CustomerId = p.CustomerId,
            RestaurantId = p.RestaurantId,
            RestaurantName = p.Restaurant?.Name ?? "General",
            Points = p.Points,
            Description = p.Description,
            Type = p.Type.ToString(),
            EarnedAt = p.EarnedAt,
            ExpiryDate = p.ExpiryDate,
            IsRedeemed = p.IsRedeemed
        }).ToList();
    }

    // Owner - Reward Management
    public async Task<RewardDto> CreateRewardAsync(CreateRewardDto dto, string ownerId)
    {
        var restaurant = await _context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == dto.RestaurantId && r.OwnerId == ownerId);

        if (restaurant == null)
            throw new Exception("Restaurant not found or you don't have permission");

        var reward = new Reward
        {
            Id = Guid.NewGuid().ToString(),
            RestaurantId = dto.RestaurantId,
            Name = dto.Name,
            Description = dto.Description,
            PointsRequired = dto.PointsRequired,
            DiscountAmount = dto.DiscountAmount,
            DiscountPercentage = dto.DiscountPercentage,
            ImageUrl = dto.ImageUrl,
            IsActive = true,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            MaxRedemptions = dto.MaxRedemptions
        };

        _context.Rewards.Add(reward);
        await _context.SaveChangesAsync(CancellationToken.None);

        return new RewardDto
        {
            Id = reward.Id,
            RestaurantId = reward.RestaurantId,
            RestaurantName = restaurant.Name,
            Name = reward.Name,
            Description = reward.Description,
            PointsRequired = reward.PointsRequired,
            DiscountAmount = reward.DiscountAmount,
            DiscountPercentage = reward.DiscountPercentage,
            ImageUrl = reward.ImageUrl,
            IsActive = reward.IsActive,
            StartDate = reward.StartDate,
            EndDate = reward.EndDate,
            MaxRedemptions = reward.MaxRedemptions,
            CurrentRedemptions = reward.CurrentRedemptions
        };
    }

    public async Task<RewardDto> UpdateRewardAsync(string rewardId, UpdateRewardDto dto, string ownerId)
    {
        var reward = await _context.Rewards
            .Include(r => r.Restaurant)
            .FirstOrDefaultAsync(r => r.Id == rewardId && r.Restaurant.OwnerId == ownerId);

        if (reward == null)
            throw new Exception("Reward not found or you don't have permission");

        reward.Name = dto.Name;
        reward.Description = dto.Description;
        reward.PointsRequired = dto.PointsRequired;
        reward.DiscountAmount = dto.DiscountAmount;
        reward.DiscountPercentage = dto.DiscountPercentage;
        reward.ImageUrl = dto.ImageUrl;
        reward.IsActive = dto.IsActive;
        reward.StartDate = dto.StartDate;
        reward.EndDate = dto.EndDate;
        reward.MaxRedemptions = dto.MaxRedemptions;

        await _context.SaveChangesAsync(CancellationToken.None);

        return new RewardDto
        {
            Id = reward.Id,
            RestaurantId = reward.RestaurantId,
            RestaurantName = reward.Restaurant.Name,
            Name = reward.Name,
            Description = reward.Description,
            PointsRequired = reward.PointsRequired,
            DiscountAmount = reward.DiscountAmount,
            DiscountPercentage = reward.DiscountPercentage,
            ImageUrl = reward.ImageUrl,
            IsActive = reward.IsActive,
            StartDate = reward.StartDate,
            EndDate = reward.EndDate,
            MaxRedemptions = reward.MaxRedemptions,
            CurrentRedemptions = reward.CurrentRedemptions
        };
    }

    public async Task<bool> DeleteRewardAsync(string rewardId, string ownerId)
    {
        var reward = await _context.Rewards
            .Include(r => r.Restaurant)
            .FirstOrDefaultAsync(r => r.Id == rewardId && r.Restaurant.OwnerId == ownerId);

        if (reward == null) return false;

        _context.Rewards.Remove(reward);
        await _context.SaveChangesAsync(CancellationToken.None);
        return true;
    }

    public async Task<List<RewardDto>> GetRestaurantRewardsAsync(string restaurantId, string? customerId = null)
    {
        var rewards = await _context.Rewards
            .Where(r => r.RestaurantId == restaurantId && r.IsActive)
            .Include(r => r.Restaurant)
            .ToListAsync();

        int availablePoints = 0;
        if (!string.IsNullOrEmpty(customerId))
        {
            var points = await _context.LoyaltyPoints
                .Where(p => p.CustomerId == customerId && p.RestaurantId == restaurantId)
                .ToListAsync();

            var earned = points.Where(p => p.Type == LoyaltyPointType.Earned || p.Type == LoyaltyPointType.Bonus).Sum(p => p.Points);
            var redeemed = points.Where(p => p.Type == LoyaltyPointType.Redeemed).Sum(p => Math.Abs(p.Points));
            availablePoints = earned - redeemed;
        }

        return rewards.Select(r => new RewardDto
        {
            Id = r.Id,
            RestaurantId = r.RestaurantId,
            RestaurantName = r.Restaurant.Name,
            Name = r.Name,
            Description = r.Description,
            PointsRequired = r.PointsRequired,
            DiscountAmount = r.DiscountAmount,
            DiscountPercentage = r.DiscountPercentage,
            ImageUrl = r.ImageUrl,
            IsActive = r.IsActive,
            StartDate = r.StartDate,
            EndDate = r.EndDate,
            MaxRedemptions = r.MaxRedemptions,
            CurrentRedemptions = r.CurrentRedemptions,
            CanRedeem = availablePoints >= r.PointsRequired && 
                       (!r.MaxRedemptions.HasValue || r.CurrentRedemptions < r.MaxRedemptions.Value) &&
                       (!r.EndDate.HasValue || r.EndDate.Value > DateTime.UtcNow)
        }).ToList();
    }

    public async Task<RewardDto?> GetRewardByIdAsync(string rewardId, string? customerId = null)
    {
        var reward = await _context.Rewards
            .Include(r => r.Restaurant)
            .FirstOrDefaultAsync(r => r.Id == rewardId);

        if (reward == null) return null;

        int availablePoints = 0;
        if (!string.IsNullOrEmpty(customerId))
        {
            var points = await _context.LoyaltyPoints
                .Where(p => p.CustomerId == customerId && p.RestaurantId == reward.RestaurantId)
                .ToListAsync();

            var earned = points.Where(p => p.Type == LoyaltyPointType.Earned || p.Type == LoyaltyPointType.Bonus).Sum(p => p.Points);
            var redeemed = points.Where(p => p.Type == LoyaltyPointType.Redeemed).Sum(p => Math.Abs(p.Points));
            availablePoints = earned - redeemed;
        }

        return new RewardDto
        {
            Id = reward.Id,
            RestaurantId = reward.RestaurantId,
            RestaurantName = reward.Restaurant.Name,
            Name = reward.Name,
            Description = reward.Description,
            PointsRequired = reward.PointsRequired,
            DiscountAmount = reward.DiscountAmount,
            DiscountPercentage = reward.DiscountPercentage,
            ImageUrl = reward.ImageUrl,
            IsActive = reward.IsActive,
            StartDate = reward.StartDate,
            EndDate = reward.EndDate,
            MaxRedemptions = reward.MaxRedemptions,
            CurrentRedemptions = reward.CurrentRedemptions,
            CanRedeem = availablePoints >= reward.PointsRequired
        };
    }

    // Customer - Reward Redemption
    public async Task<RewardRedemptionDto> RedeemRewardAsync(string rewardId, string customerId)
    {
        var reward = await _context.Rewards
            .Include(r => r.Restaurant)
            .FirstOrDefaultAsync(r => r.Id == rewardId);

        if (reward == null)
            throw new Exception("Reward not found");

        if (!reward.IsActive)
            throw new Exception("This reward is not active");

        if (reward.EndDate.HasValue && reward.EndDate.Value < DateTime.UtcNow)
            throw new Exception("This reward has expired");

        if (reward.MaxRedemptions.HasValue && reward.CurrentRedemptions >= reward.MaxRedemptions.Value)
            throw new Exception("This reward has reached its maximum redemptions");

        // Check customer points
        var points = await _context.LoyaltyPoints
            .Where(p => p.CustomerId == customerId && p.RestaurantId == reward.RestaurantId)
            .ToListAsync();

        var earned = points.Where(p => p.Type == LoyaltyPointType.Earned || p.Type == LoyaltyPointType.Bonus).Sum(p => p.Points);
        var redeemed = points.Where(p => p.Type == LoyaltyPointType.Redeemed).Sum(p => Math.Abs(p.Points));
        var availablePoints = earned - redeemed;

        if (availablePoints < reward.PointsRequired)
            throw new Exception("Insufficient points");

        // Create redemption
        var couponCode = GenerateUniqueCouponCode();
        var redemption = new RewardRedemption
        {
            Id = Guid.NewGuid().ToString(),
            CustomerId = customerId,
            RewardId = rewardId,
            PointsSpent = reward.PointsRequired,
            CouponCode = couponCode,
            RedeemedAt = DateTime.UtcNow,
            ExpiryDate = DateTime.UtcNow.AddDays(30)
        };

        _context.RewardRedemptions.Add(redemption);

        // Deduct points
        var pointDeduction = new LoyaltyPoint
        {
            Id = Guid.NewGuid().ToString(),
            CustomerId = customerId,
            RestaurantId = reward.RestaurantId,
            Points = -reward.PointsRequired,
            Description = $"Redeemed reward: {reward.Name}",
            Type = LoyaltyPointType.Redeemed,
            EarnedAt = DateTime.UtcNow,
            IsRedeemed = true,
            RedeemedAt = DateTime.UtcNow
        };

        _context.LoyaltyPoints.Add(pointDeduction);

        // Update reward redemption count
        reward.CurrentRedemptions++;

        await _context.SaveChangesAsync(CancellationToken.None);

        return new RewardRedemptionDto
        {
            Id = redemption.Id,
            RewardName = reward.Name,
            RestaurantName = reward.Restaurant.Name,
            PointsSpent = redemption.PointsSpent,
            CouponCode = redemption.CouponCode,
            RedeemedAt = redemption.RedeemedAt,
            IsUsed = redemption.IsUsed,
            UsedAt = redemption.UsedAt,
            ExpiryDate = redemption.ExpiryDate
        };
    }

    public async Task<List<RewardRedemptionDto>> GetCustomerRedemptionsAsync(string customerId)
    {
        var redemptions = await _context.RewardRedemptions
            .Where(r => r.CustomerId == customerId)
            .Include(r => r.Reward)
            .ThenInclude(rw => rw.Restaurant)
            .OrderByDescending(r => r.RedeemedAt)
            .ToListAsync();

        return redemptions.Select(r => new RewardRedemptionDto
        {
            Id = r.Id,
            RewardName = r.Reward.Name,
            RestaurantName = r.Reward.Restaurant.Name,
            PointsSpent = r.PointsSpent,
            CouponCode = r.CouponCode,
            RedeemedAt = r.RedeemedAt,
            IsUsed = r.IsUsed,
            UsedAt = r.UsedAt,
            ExpiryDate = r.ExpiryDate
        }).ToList();
    }

    public async Task<RewardRedemptionDto?> GetRedemptionByIdAsync(string redemptionId, string customerId)
    {
        var redemption = await _context.RewardRedemptions
            .Where(r => r.Id == redemptionId && r.CustomerId == customerId)
            .Include(r => r.Reward)
            .ThenInclude(rw => rw.Restaurant)
            .FirstOrDefaultAsync();

        if (redemption == null) return null;

        return new RewardRedemptionDto
        {
            Id = redemption.Id,
            RewardName = redemption.Reward.Name,
            RestaurantName = redemption.Reward.Restaurant.Name,
            PointsSpent = redemption.PointsSpent,
            CouponCode = redemption.CouponCode,
            RedeemedAt = redemption.RedeemedAt,
            IsUsed = redemption.IsUsed,
            UsedAt = redemption.UsedAt,
            ExpiryDate = redemption.ExpiryDate
        };
    }

    // Helper methods
    private string GenerateUniqueCode()
    {
        return $"LP-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
    }

    private string GenerateUniqueCouponCode()
    {
        return $"CPT-{Guid.NewGuid().ToString().Substring(0, 10).ToUpper()}";
    }
}

