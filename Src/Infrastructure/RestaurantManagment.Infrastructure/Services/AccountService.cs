using Microsoft.EntityFrameworkCore;
using RestaurantManagment.Application.Common.Interfaces;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Infrastructure.Services;

public class AccountService(IAppDbContext _context) : IAccountService
{
 
    public async Task CreateApplicationAsync(OwnershipApplication application)
    {
        _context.OwnershipApplications.Add(application);
        await _context.SaveChangesAsync();
    }
    
}
