using Microsoft.EntityFrameworkCore;
using RestaurantManagment.Application.Common.Interfaces;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Infrastructure.Services;

public class AccountService : IAccountService
{
    private readonly IAppDbContext _context;

    public AccountService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task CreateApplicationAsync(OwnershipApplication application)
    {
        _context.OwnershipApplications.Add(application);
        await _context.SaveChangesAsync();
    }

    public async Task<OwnershipApplication?> GetApplicationByIdAsync(int id)
    {
        return await _context.OwnershipApplications
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id.ToString() == id.ToString() && !a.IsDeleted);
    }

    public async Task<IEnumerable<OwnershipApplication>> GetPendingApplicationsAsync()
    {
        return await _context.OwnershipApplications
            .Include(a => a.User)
            .Where(a => a.Status == ApplicationStatus.Pending && !a.IsDeleted)
            .OrderBy(a => a.ApplicationDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<OwnershipApplication>> GetApplicationsByUserIdAsync(string userId)
    {
        return await _context.OwnershipApplications
            .Where(a => a.UserId == userId && !a.IsDeleted)
            .OrderByDescending(a => a.ApplicationDate)
            .ToListAsync();
    }

    public async Task ApproveApplicationAsync(int applicationId, string reviewerId)
    {
        var application = await _context.OwnershipApplications.FindAsync(applicationId);
        if (application == null)
            throw new Exception("Başvuru bulunamadı");

        application.Status = ApplicationStatus.Approved;
        application.ReviewedBy = reviewerId;
        application.ReviewedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task RejectApplicationAsync(int applicationId, string reviewerId, string reason)
    {
        var application = await _context.OwnershipApplications.FindAsync(applicationId);
        if (application == null)
            throw new Exception("Başvuru bulunamadı");

        application.Status = ApplicationStatus.Rejected;
        application.ReviewedBy = reviewerId;
        application.ReviewedAt = DateTime.UtcNow;
        application.RejectionReason = reason;

        await _context.SaveChangesAsync();
    }
}
