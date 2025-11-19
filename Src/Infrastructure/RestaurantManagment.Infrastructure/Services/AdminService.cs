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
using RestaurantManagment.Application.Common.DTOs.Review;
using RestaurantManagment.Domain.Enums;

namespace RestaurantManagment.Infrastructure.Services;

public class AdminService(IAppDbContext _context,UserManager<AppUser> _userManager, RoleManager<IdentityRole> _roleManager, IMapper _mapper) : IAdminService
{
    
    public async Task<OwnershipApplicationResponseDto?> GetApplicationByIdAsync(string id)
    {
        var application = await _context.OwnershipApplications
            .Include(a => a.User)
            .Where(a => a.Id == id && !a.IsDeleted)
            .FirstOrDefaultAsync();

        if (application == null)
            return null;

        return new OwnershipApplicationResponseDto
        {
            Id = application.Id,
            UserId = application.UserId,
            BusinessName = application.BusinessName,
            BusinessDescription = application.BusinessDescription,
            BusinessAddress = application.BusinessAddress,
            BusinessPhone = application.BusinessPhone,
            BusinessEmail = application.BusinessEmail,
            Category = application.Category,
            AdditionalNotes = application.AdditionalNotes,
            Status = application.Status.ToString(),
            ApplicationDate = application.ApplicationDate,
            ReviewedBy = application.ReviewedBy,
            ReviewedAt = application.ReviewedAt,
            RejectionReason = application.RejectionReason,
            CreatedAt = application.CreatedAt,
            CreatedBy = application.CreatedBy,
            UpdatedAt = application.UpdatedAt,
            UpdatedBy = application.UpdatedBy,
            User = new UserBasicInfoDto
            {
                FirstName = application.User.FirstName,
                LastName = application.User.LastName
            }
        };
    }

    public async Task<IEnumerable<OwnershipApplicationResponseDto>> GetPendingApplicationsAsync()
    {
        var applications = await _context.OwnershipApplications
            .Include(a => a.User)
            .Where(a => a.Status == ApplicationStatus.Pending && !a.IsDeleted)
            .OrderBy(a => a.ApplicationDate)
            .ToListAsync();

        var result = applications.Select(a => new OwnershipApplicationResponseDto
        {
            Id = a.Id,
            UserId = a.UserId,
            BusinessName = a.BusinessName,
            BusinessDescription = a.BusinessDescription,
            BusinessAddress = a.BusinessAddress,
            BusinessPhone = a.BusinessPhone,
            BusinessEmail = a.BusinessEmail,
            Category = a.Category,
            AdditionalNotes = a.AdditionalNotes,
            Status = a.Status.ToString(),
            ApplicationDate = a.ApplicationDate,
            ReviewedBy = a.ReviewedBy,
            ReviewedAt = a.ReviewedAt,
            RejectionReason = a.RejectionReason,
            CreatedAt = a.CreatedAt,
            CreatedBy = a.CreatedBy,
            UpdatedAt = a.UpdatedAt,
            UpdatedBy = a.UpdatedBy,
            User = new UserBasicInfoDto
            {
                FirstName = a.User.FirstName,
                LastName = a.User.LastName
            }
        }).ToList();

        return result;
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

        
        var user = await _userManager.FindByIdAsync(application.UserId);
        
        if (user == null)
            throw new Exception("User not found");
        
        var currentRoles = await _userManager.GetRolesAsync(user);
        
      
        if (currentRoles.Any())
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
            {
                var errors = string.Join(", ", removeResult.Errors.Select(e => e.Description));
                throw new Exception($"Failed to remove existing roles: {errors}");
            }
        }
        
       
        var addResult = await _userManager.AddToRoleAsync(user, "RestaurantOwner");
        if (!addResult.Succeeded)
        {
            var errors = string.Join(", ", addResult.Errors.Select(e => e.Description));
            throw new Exception($"Failed to add RestaurantOwner role: {errors}");
        }
        
        var restaurant = new Restaurant
        {
            Name = application.BusinessName,
            Description = application.BusinessDescription,
            Address = application.BusinessAddress,
            PhoneNumber = application.BusinessPhone,
            Email = application.BusinessEmail,
            OwnerId = application.UserId,
            Rate = 0,
            CreatedAt = DateTime.UtcNow
        };

        _context.Restaurants.Add(restaurant);
        
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
       
        var query = _context.Users.IgnoreQueryFilters().AsQueryable();

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
            .IgnoreQueryFilters()
            .Include(r => r.Owner);

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

    public async Task ToggleUserActiveStatusAsync(string userId)
    {
      
        var user = await _context.Users.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == userId);
            
        if (user == null)
            throw new Exception("User not found");

    
        user.IsDeleted = !user.IsDeleted;
        
        if (user.IsDeleted)
        {
            user.DeletedAt = DateTime.UtcNow;
        }
        else
        {
            user.DeletedAt = null;
        }
        _context.Users.Update(user);

        await _context.SaveChangesAsync();
    }

    public async Task<List<string>> GetUserRolesAsync(string userId)
    {
     
        var user = await _context.Users.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == userId);
            
        if (user == null)
            throw new Exception("User not found");

        var roles = await _userManager.GetRolesAsync(user);
        return roles.ToList();
    }

    public async Task AddRoleToUserAsync(string userId, string role)
    {
        
        var user = await _context.Users.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == userId);
            
        if (user == null)
            throw new Exception("User not found");

        var roleExists = await _roleManager.RoleExistsAsync(role);
        if (!roleExists)
            throw new Exception($"Role '{role}' does not exist");

        var isInRole = await _userManager.IsInRoleAsync(user, role);
        if (isInRole)
            throw new Exception($"User already has the '{role}' role");

        var result = await _userManager.AddToRoleAsync(user, role);
        if (!result.Succeeded)
            throw new Exception($"Failed to add role: {string.Join(", ", result.Errors.Select(e => e.Description))}");
    }

    public async Task RemoveRoleFromUserAsync(string userId, string role)
    {
     
        var user = await _context.Users.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == userId);
            
        if (user == null)
            throw new Exception("User not found");

        var isInRole = await _userManager.IsInRoleAsync(user, role);
        if (!isInRole)
            throw new Exception($"User does not have the '{role}' role");

        var result = await _userManager.RemoveFromRoleAsync(user, role);
        if (!result.Succeeded)
            throw new Exception($"Failed to remove role: {string.Join(", ", result.Errors.Select(e => e.Description))}");
    }

    public async Task<List<string>> GetAllRolesAsync()
    {
        var roles = await _roleManager.Roles.Select(r => r.Name).ToListAsync();
        return roles.Where(r => r != null).Cast<string>().ToList();
    }

    public async Task ToggleRestaurantActiveStatusAsync(string restaurantId)
    {

        var restaurant = await _context.Restaurants.IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.Id == restaurantId);
            
        if (restaurant == null)
            throw new Exception("Restaurant not found");


        restaurant.IsDeleted = !restaurant.IsDeleted;
        
        if (restaurant.IsDeleted)
        {
            restaurant.DeletedAt = DateTime.UtcNow;
        }
        else
        {
            restaurant.DeletedAt = null;
        }

        await _context.SaveChangesAsync();
    }

  
    public async Task UpdateRestaurantCategoryAsync(string restaurantId, int categoryId)
    {
        var restaurant = await _context.Restaurants.IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.Id == restaurantId);
            
        if (restaurant == null)
            throw new Exception("Restaurant not found");

        if (!Enum.IsDefined(typeof(RestaurantCategory), categoryId))
            throw new Exception("Invalid category");

        restaurant.Category = (RestaurantCategory)categoryId;
        restaurant.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }   

    public async Task<List<string>> GetAllRestaurantCategoriesAsync()
    {
        var categories = Enum.GetValues(typeof(RestaurantCategory))
            .Cast<RestaurantCategory>()
            .Select(c => new { Id = (int)c, Name = c.ToString() })
            .Select(c => $"{c.Id}:{c.Name}")
            .ToList();
            
        return await Task.FromResult(categories);
    }

  
    public async Task<PaginatedResult<ReviewDto>> GetAllReviewsAsync(int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.Reviews
            .Include(r => r.Customer)
            .Include(r => r.Restaurant)
            .Where(r => !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAt);

        var totalCount = await query.CountAsync();
        var reviews = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var reviewDtos = _mapper.Map<List<ReviewDto>>(reviews);

        return new PaginatedResult<ReviewDto>
        {
            Items = reviewDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<PaginatedResult<ReviewDto>> GetPendingReviewsAsync(int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.Reviews
            .Include(r => r.Customer)
            .Include(r => r.Restaurant)
            .Where(r => !r.IsDeleted && r.Status == "Pending")
            .OrderByDescending(r => r.CreatedAt);

        var totalCount = await query.CountAsync();
        var reviews = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var reviewDtos = _mapper.Map<List<ReviewDto>>(reviews);

        return new PaginatedResult<ReviewDto>
        {
            Items = reviewDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<PaginatedResult<ReviewDto>> GetReportedReviewsAsync(int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.Reviews
            .Include(r => r.Customer)
            .Include(r => r.Restaurant)
            .Where(r => !r.IsDeleted && r.IsReported)
            .OrderByDescending(r => r.ReportedAt);

        var totalCount = await query.CountAsync();
        var reviews = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var reviewDtos = _mapper.Map<List<ReviewDto>>(reviews);

        return new PaginatedResult<ReviewDto>
        {
            Items = reviewDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<ReviewDto?> GetReviewByIdAsync(string reviewId)
    {
        var review = await _context.Reviews
            .Include(r => r.Customer)
            .Include(r => r.Restaurant)
            .FirstOrDefaultAsync(r => r.Id == reviewId && !r.IsDeleted);

        if (review == null)
            return null;

        return _mapper.Map<ReviewDto>(review);
    }

    public async Task ApproveReviewAsync(string reviewId)
    {
        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == reviewId && !r.IsDeleted);

        if (review == null)
            throw new Exception("Review not found");

        review.Status = "Approved";
        review.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task RejectReviewAsync(string reviewId, string? reason = null)
    {
        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == reviewId && !r.IsDeleted);

        if (review == null)
            throw new Exception("Review not found");

        review.Status = "Rejected";
        review.UpdatedAt = DateTime.UtcNow;
        
        if (!string.IsNullOrEmpty(reason))
        {
            review.OwnerResponse = $"[Rejected by Admin: {reason}]";
        }

        await _context.SaveChangesAsync();
    }

    public async Task DeleteReviewAsync(string reviewId)
    {
        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == reviewId && !r.IsDeleted);

        if (review == null)
            throw new Exception("Review not found");

        review.IsDeleted = true;
        review.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
