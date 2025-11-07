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
    
    // Admin Dashboard methods
    Task<AdminDashboardDto> GetAdminDashboardDataAsync();
    
    // Pagination methods
    Task<PaginatedResult<UserAdminShowDto>> GetUsersAsync(int pageNumber = 1, int pageSize = 5);
    Task<PaginatedResult<RestaurantAdminListDto>> GetRestaurantsAsync(int pageNumber = 1, int pageSize = 5);
    Task<PaginatedResult<OwnershipApplicationAdminDto>> GetOwnershipApplicationsAsync(int pageNumber = 1, int pageSize = 5);
}