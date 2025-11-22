using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RestaurantManagment.Application.Common.DTOs.Account;
using RestaurantManagment.Application.Common.DTOs.Admin;
using RestaurantManagment.Application.Common.DTOs.Common;
using RestaurantManagment.Application.Common.DTOs.Restaurant;
using RestaurantManagment.Application.Common.Interfaces;
using RestaurantManagment.Domain.Models;
using AutoMapper;
using RestaurantManagment.Application.Common.DTOs.Review;
using RestaurantManagment.Domain.Enums;
using RestaurantManagment.Application.DTOs.Restaurant;

namespace RestaurantManagment.Infrastructure.Services;

public class AdminService(IAppDbContext _context,UserManager<AppUser> _userManager, RoleManager<IdentityRole> _roleManager, IMapper _mapper, IFileService _fileService) : IAdminService
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
        
       
        RestaurantCategory? category = null;
        if (!string.IsNullOrEmpty(application.Category))
        {
            if (Enum.TryParse<RestaurantCategory>(application.Category, true, out var parsedCategory))
            {
                category = parsedCategory;
            }
        }
        
        var restaurant = new Restaurant
        {
            Name = application.BusinessName,
            Description = application.BusinessDescription,
            Category = category,
            Address = application.BusinessAddress,
            PhoneNumber = application.BusinessPhone,
            ImageUrl = application.ImageUrl,
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
        Console.WriteLine($"[DEBUG AdminService] AddRoleToUserAsync called - UserId: {userId}, Role: '{role}'");

        // Use UserManager to find user instead of DbContext to avoid tracking conflicts
        var user = await _userManager.FindByIdAsync(userId);
        
        Console.WriteLine($"[DEBUG AdminService] User found: {user != null}");
        if (user != null)
        {
            Console.WriteLine($"[DEBUG AdminService] User details - Email: {user.Email}, FullName: {user.FullName}");
        }
            
        if (user == null)
            throw new Exception("User not found");

        Console.WriteLine($"[DEBUG AdminService] Checking if role exists: '{role}'");
        var roleExists = await _roleManager.RoleExistsAsync(role);
        Console.WriteLine($"[DEBUG AdminService] Role exists: {roleExists}");
        
        if (!roleExists)
            throw new Exception($"Role '{role}' does not exist");

        Console.WriteLine($"[DEBUG AdminService] Checking if user is already in role");
        var isInRole = await _userManager.IsInRoleAsync(user, role);
        Console.WriteLine($"[DEBUG AdminService] User is already in role: {isInRole}");
        
        if (isInRole)
            throw new Exception($"User already has the '{role}' role");

        Console.WriteLine($"[DEBUG AdminService] Adding role to user...");
        var result = await _userManager.AddToRoleAsync(user, role);
        Console.WriteLine($"[DEBUG AdminService] AddToRoleAsync succeeded: {result.Succeeded}");
        
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            Console.WriteLine($"[ERROR AdminService] Failed to add role. Errors: {errors}");
            throw new Exception($"Failed to add role: {errors}");
        }
        
        Console.WriteLine($"[DEBUG AdminService] Role added successfully");
    }

    public async Task RemoveRoleFromUserAsync(string userId, string role)
    {

        // Use UserManager to find user instead of DbContext to avoid tracking conflicts
        var user = await _userManager.FindByIdAsync(userId);
            
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

    public async Task<RestaurantResponseDto?> GetRestaurantByIdAsync(string restaurantId)
    {
        var restaurant = await _context.Restaurants
            .IgnoreQueryFilters()
            .Include(r => r.Owner)
            .FirstOrDefaultAsync(r => r.Id == restaurantId);
            
        if (restaurant == null)
            return null;

        return new RestaurantResponseDto
        {
            Id = restaurant.Id,
            Name = restaurant.Name,
            Address = restaurant.Address,
            PhoneNumber = restaurant.PhoneNumber,
            Email = restaurant.Email,
            Website = restaurant.Website,
            Description = restaurant.Description,
            ImageUrl = restaurant.ImageUrl,
            Category = restaurant.Category?.ToString(),
            Latitude = restaurant.Latitude,
            Longitude = restaurant.Longitude,
            OwnerId = restaurant.OwnerId,
            OwnerName = restaurant.Owner.FullName,
            CreatedAt = restaurant.CreatedAt,
            UpdatedAt = restaurant.UpdatedAt
        };
    }

    public async Task UpdateRestaurantAsync(string restaurantId, UpdateRestaurantDto dto)
    {
        var restaurant = await _context.Restaurants.IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.Id == restaurantId);
            
        if (restaurant == null)
            throw new Exception("Restaurant not found");

        restaurant.Name = dto.Name;
        restaurant.Address = dto.Address;
        restaurant.PhoneNumber = dto.PhoneNumber;
        restaurant.Email = dto.Email;
        restaurant.Website = dto.Website;
        restaurant.Description = dto.Description;
        
        
        if (!string.IsNullOrWhiteSpace(dto.Latitude))
        {
          
            var latString = dto.Latitude.Replace(',', '.');
            if (double.TryParse(latString, System.Globalization.NumberStyles.Any, 
                System.Globalization.CultureInfo.InvariantCulture, out var lat))
            {
                restaurant.Latitude = lat;
            }
        }
        
        if (!string.IsNullOrWhiteSpace(dto.Longitude))
        {
            var lngString = dto.Longitude.Replace(',', '.');
            if (double.TryParse(lngString, System.Globalization.NumberStyles.Any, 
                System.Globalization.CultureInfo.InvariantCulture, out var lng))
            {
                restaurant.Longitude = lng;
            }
        }

       
        if (!string.IsNullOrEmpty(dto.Category))
        {
            if (Enum.TryParse<RestaurantCategory>(dto.Category, ignoreCase: true, out var category))
            {
                restaurant.Category = category;
            }
        }

        
        if (dto.ImageFile != null && dto.ImageFile.Length > 0)
        {
            if (!string.IsNullOrEmpty(restaurant.ImageUrl))
            {
                try
                {
                    await _fileService.DeleteFileAsync(restaurant.ImageUrl);
                }
                catch
                {
                    // Ignore deletion errors
                }
            }

            // Upload new image
            restaurant.ImageUrl = await _fileService.UploadFileAsync(dto.ImageFile, "restaurants");
        }

        restaurant.UpdatedAt = DateTime.UtcNow;
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
       
        var allStatuses = await _context.Reviews
            .Where(r => !r.IsDeleted)
            .Select(r => r.Status)
            .Distinct()
            .ToListAsync();
        
        Console.WriteLine($"[DEBUG] All review statuses in DB: {string.Join(", ", allStatuses)}");
        
       
        var query = _context.Reviews
            .Include(r => r.Customer)
            .Include(r => r.Restaurant)
            .Where(r => !r.IsDeleted && (r.Status == "Pending" || r.Status == "pending" || r.Status == "PENDING"))
            .OrderByDescending(r => r.CreatedAt);

        var totalCount = await query.CountAsync();
        Console.WriteLine($"[DEBUG] Total pending reviews found: {totalCount}");
        
        var reviews = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        Console.WriteLine($"[DEBUG] Retrieved {reviews.Count} reviews from database for page {pageNumber}");

      
        var reviewDtos = new List<ReviewDto>();
        foreach (var review in reviews)
        {
            try
            {
                var dto = new ReviewDto
                {
                    Id = review.Id,
                    RestaurantId = review.RestaurantId,
                    RestaurantName = review.Restaurant?.Name ?? "Unknown Restaurant",
                    CustomerId = review.CustomerId,
                    CustomerName = review.Customer?.FullName ?? "Unknown Customer",
                    CustomerEmail = review.Customer?.Email,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    Status = review.Status,
                    OwnerResponse = review.OwnerResponse,
                    CreatedAt = review.CreatedAt,
                    RespondedAt = review.RespondedAt,
                    IsReported = review.IsReported,
                    ReportReason = review.ReportReason,
                    ReportedAt = review.ReportedAt,
                    AdminNote = review.AdminNote
                };
                reviewDtos.Add(dto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Error mapping review {review.Id}: {ex.Message}");
            }
        }

        Console.WriteLine($"[DEBUG] Successfully mapped {reviewDtos.Count} review DTOs");

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
