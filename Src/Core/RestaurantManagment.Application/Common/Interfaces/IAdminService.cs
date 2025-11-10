using RestaurantManagment.Application.Common.DTOs.Account;
using RestaurantManagment.Application.Common.DTOs.Admin;
using RestaurantManagment.Application.Common.DTOs.Common;
using RestaurantManagment.Application.Common.DTOs.Restaurant;
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
}
