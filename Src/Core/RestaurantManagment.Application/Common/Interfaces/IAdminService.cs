using RestaurantManagment.Application.Common.DTOs.Account;
using RestaurantManagment.Application.Common.DTOs.Admin;
using RestaurantManagment.Application.Common.DTOs.Common;
using RestaurantManagment.Application.Common.DTOs.Restaurant;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Application.Common.Interfaces;

public interface IAdminService
{
    Task<OwnershipApplication?> GetApplicationByIdAsync(int id);
    Task<IEnumerable<OwnershipApplication>> GetPendingApplicationsAsync();
    Task<IEnumerable<OwnershipApplication>> GetApplicationsByUserIdAsync(string userId);
    Task ApproveApplicationAsync(int applicationId, string reviewerId);
    Task RejectApplicationAsync(int applicationId, string reviewerId, string reason);
    
    // Admin Dashboard methods
    Task<AdminDashboardDto> GetAdminDashboardDataAsync();
    
    // Pagination methods
    Task<PaginatedResult<UserAdminShowDto>> GetUsersAsync(int pageNumber = 1, int pageSize = 5);
    Task<PaginatedResult<RestaurantAdminListDto>> GetRestaurantsAsync(int pageNumber = 1, int pageSize = 5);
    Task<PaginatedResult<OwnershipApplicationAdminDto>> GetOwnershipApplicationsAsync(int pageNumber = 1, int pageSize = 5);
}