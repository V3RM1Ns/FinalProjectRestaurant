using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Application.Common.Interfaces;

public interface IAccountService
{
    Task CreateApplicationAsync(OwnershipApplication application);
}

