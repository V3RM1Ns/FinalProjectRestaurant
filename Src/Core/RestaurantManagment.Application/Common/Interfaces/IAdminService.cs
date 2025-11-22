using RestaurantManagment.Application.Common.DTOs.Account;
using RestaurantManagment.Application.Common.DTOs.Admin;
using RestaurantManagment.Application.Common.DTOs.Common;
using RestaurantManagment.Application.Common.DTOs.Restaurant;
using RestaurantManagment.Application.Common.DTOs.Review;
using RestaurantManagment.Application.DTOs.Restaurant;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Application.Common.Interfaces;

public interface IAdminService
{
    Task<OwnershipApplicationResponseDto?> GetApplicationByIdAsync(string id);
    Task<IEnumerable<OwnershipApplicationResponseDto>> GetPendingApplicationsAsync();
    Task<IEnumerable<OwnershipApplication>> GetApplicationsByUserIdAsync(string userId);
    Task ApproveApplicationAsync(string applicationId, string reviewerId);
    Task RejectApplicationAsync(string applicationId, string reviewerId, string reason);
   
    Task<AdminDashboardDto> GetAdminDashboardDataAsync();
    
    Task<PaginatedResult<UserAdminShowDto>> GetUsersAsync(int pageNumber = 1, int pageSize = 5);
    Task<PaginatedResult<RestaurantAdminListDto>> GetRestaurantsAsync(int pageNumber = 1, int pageSize = 5);
    Task<PaginatedResult<OwnershipApplicationAdminDto>> GetOwnershipApplicationsAsync(int pageNumber = 1, int pageSize = 5);
    
    Task ToggleUserActiveStatusAsync(string userId);
    Task<List<string>> GetUserRolesAsync(string userId);
    Task AddRoleToUserAsync(string userId, string role);
    Task RemoveRoleFromUserAsync(string userId, string role);
    Task<List<string>> GetAllRolesAsync();

    Task ToggleRestaurantActiveStatusAsync(string restaurantId);
    Task<RestaurantResponseDto?> GetRestaurantByIdAsync(string restaurantId);
    Task UpdateRestaurantAsync(string restaurantId, UpdateRestaurantDto dto);
    
    Task UpdateRestaurantCategoryAsync(string restaurantId, int categoryId);
    Task<List<string>> GetAllRestaurantCategoriesAsync();
    
  
    Task<PaginatedResult<ReviewDto>> GetAllReviewsAsync(int pageNumber = 1, int pageSize = 10);
    Task<PaginatedResult<ReviewDto>> GetPendingReviewsAsync(int pageNumber = 1, int pageSize = 10);
    Task<PaginatedResult<ReviewDto>> GetReportedReviewsAsync(int pageNumber = 1, int pageSize = 10);
    Task<ReviewDto?> GetReviewByIdAsync(string reviewId);
    Task ApproveReviewAsync(string reviewId);
    Task RejectReviewAsync(string reviewId, string? reason = null);
    Task DeleteReviewAsync(string reviewId);
}
