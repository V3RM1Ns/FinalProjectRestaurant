using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Application.Common.Interfaces;

public interface IAccountService
{
    Task CreateApplicationAsync(OwnershipApplication application);
    Task<OwnershipApplication?> GetApplicationByIdAsync(int id);
    Task<IEnumerable<OwnershipApplication>> GetPendingApplicationsAsync();
    Task<IEnumerable<OwnershipApplication>> GetApplicationsByUserIdAsync(string userId);
    Task ApproveApplicationAsync(int applicationId, string reviewerId);
    Task RejectApplicationAsync(int applicationId, string reviewerId, string reason);
}

