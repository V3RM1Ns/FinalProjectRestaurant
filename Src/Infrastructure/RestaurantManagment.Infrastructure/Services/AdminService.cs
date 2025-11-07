using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RestaurantManagment.Application.Common.DTOs.Account;
using RestaurantManagment.Application.Common.DTOs.Admin;
using RestaurantManagment.Application.Common.DTOs.Common;
using RestaurantManagment.Application.Common.DTOs.Restaurant;
using RestaurantManagment.Application.Common.Interfaces;
using RestaurantManagment.Domain.Models;
using AutoMapper;
using AutoMapper.QueryableExtensions;

namespace RestaurantManagment.Infrastructure.Services;

public class AdminService(IAppDbContext _context,UserManager<AppUser> _userManager, IMapper _mapper) : IAdminService
{
    
    public async Task<OwnershipApplicationResponseDto?> GetApplicationByIdAsync(string id)
    {
        return await _context.OwnershipApplications
            .Include(a => a.User)
            .Where(a => a.Id == id && !a.IsDeleted)
            .ProjectTo<OwnershipApplicationResponseDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<OwnershipApplicationResponseDto>> GetPendingApplicationsAsync()
    {
        var applications = await _context.OwnershipApplications
            .Include(a => a.User)
            .Where(a => a.Status == ApplicationStatus.Pending && !a.IsDeleted)
            .OrderBy(a => a.ApplicationDate)
            .ToListAsync();

        return _mapper.Map<IEnumerable<OwnershipApplicationResponseDto>>(applications);
    }

    public async Task<IEnumerable<OwnershipApplication>> GetApplicationsByUserIdAsync(string userId)
    {
        return await _context.OwnershipApplications
            .Where(a => a.UserId == userId && !a.IsDeleted)
            .OrderByDescending(a => a.ApplicationDate)
            .ToListAsync();
    }

    public async Task ApproveApplicationAsync(string applicationId, string reviewerId)
    {
        var application = await _context.OwnershipApplications
            .FirstOrDefaultAsync(a => a.Id == applicationId && !a.IsDeleted);
        
        if (application == null)
            throw new Exception("Application not found");

        application.Status = ApplicationStatus.Approved;
        application.ReviewedBy = reviewerId;
        application.ReviewedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task RejectApplicationAsync(string applicationId, string reviewerId, string reason)
    {
        var application = await _context.OwnershipApplications
            .FirstOrDefaultAsync(a => a.Id == applicationId && !a.IsDeleted);
        
        if (application == null)
            throw new Exception("Application not found");

        application.Status = ApplicationStatus.Rejected;
        application.ReviewedBy = reviewerId;
        application.ReviewedAt = DateTime.UtcNow;
        application.RejectionReason = reason;

        await _context.SaveChangesAsync();
    }

    public async Task<AdminDashboardDto> GetAdminDashboardDataAsync()
    {
        var dashboard = new AdminDashboardDto();

     
        dashboard.TotalUsers = await _userManager.Users
            .Where(u => !u.IsDeleted)
            .CountAsync();

        
        dashboard.TotalRestaurants = await _context.Restaurants
            .Where(r => !r.IsDeleted)
            .CountAsync();

         
        var restaurantOwnerRole = "RestaurantOwner";
        var ownersQuery = _userManager.Users.Where(u => !u.IsDeleted);
        var allOwners = await ownersQuery.ToListAsync();
        var owners = new List<AppUser>();
        
        foreach (var user in allOwners)
        {
            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Contains(restaurantOwnerRole))
            {
                owners.Add(user);
            }
        }
        dashboard.TotalRestaurantOwners = owners.Count;

        var employeeRole = "Employee";
        var employeesQuery = _userManager.Users.Where(u => !u.IsDeleted);
        var allEmployees = await employeesQuery.ToListAsync();
        var employees = new List<AppUser>();
        
        foreach (var user in allEmployees)
        {
            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Contains(employeeRole))
            {
                employees.Add(user);
            }
        }
        dashboard.TotalEmployees = employees.Count;

        dashboard.TotalPendingApplications = await _context.OwnershipApplications
            .Where(a => a.Status == ApplicationStatus.Pending && !a.IsDeleted)
            .CountAsync();

        return dashboard;
    }

    public async Task<PaginatedResult<UserAdminShowDto>> GetUsersAsync(int pageNumber = 1, int pageSize = 5)
    {
        var query = _userManager.Users.Where(u => !u.IsDeleted);

        var totalCount = await query.CountAsync();

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var userDtos = new List<UserAdminShowDto>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            userDtos.Add(new UserAdminShowDto
            {
                Id = user.Id,
                UserName = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                IsActive = !user.IsDeleted,
                Role = roles.FirstOrDefault() ?? "User"
            });
        }

        return new PaginatedResult<UserAdminShowDto>
        {
            Items = userDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<PaginatedResult<RestaurantAdminListDto>> GetRestaurantsAsync(int pageNumber = 1, int pageSize = 5)
    {
        var query = _context.Restaurants
            .Include(r => r.Owner)
            .Where(r => !r.IsDeleted);

        var totalCount = await query.CountAsync();

        var restaurants = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var restaurantDtos = _mapper.Map<List<RestaurantAdminListDto>>(restaurants);

        return new PaginatedResult<RestaurantAdminListDto>
        {
            Items = restaurantDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<PaginatedResult<OwnershipApplicationAdminDto>> GetOwnershipApplicationsAsync(int pageNumber = 1, int pageSize = 5)
    {
        var query = _context.OwnershipApplications
            .Include(a => a.User)
            .Where(a => !a.IsDeleted);

        var totalCount = await query.CountAsync();

        var applications = await query
            .OrderByDescending(a => a.ApplicationDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var applicationDtos = _mapper.Map<List<OwnershipApplicationAdminDto>>(applications);

        return new PaginatedResult<OwnershipApplicationAdminDto>
        {
            Items = applicationDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }
}