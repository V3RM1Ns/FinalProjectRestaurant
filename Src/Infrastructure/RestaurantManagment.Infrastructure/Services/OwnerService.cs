using RestaurantManagment.Application.Common.DTOs.Common;
using RestaurantManagment.Application.Common.DTOs.Employee;
using RestaurantManagment.Application.Common.DTOs.JobApplication;
using RestaurantManagment.Application.Common.DTOs.Menu;
using RestaurantManagment.Application.Common.DTOs.MenuItem;
using RestaurantManagment.Application.Common.DTOs.Order;
using RestaurantManagment.Application.Common.DTOs.Owner;
using RestaurantManagment.Application.Common.DTOs.Reservation;
using RestaurantManagment.Application.Common.DTOs.Restaurant;
using RestaurantManagment.Application.Common.DTOs.Review;
using RestaurantManagment.Application.Common.Interfaces;
using RestaurantManagment.Domain.Models;
using RestaurantManagment.Domain.Enums;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using RestaurantManagment.Application.Common.DTOs.Reward;

namespace RestaurantManagment.Infrastructure.Services;

public class OwnerService(IAppDbContext context, IMapper mapper, UserManager<AppUser> userManager): IOwnerService
{
    public async Task<IEnumerable<OwnerRestaurantDto>> GetOwnerRestaurantsAsync(string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));
            
        var restaurants = await context.Restaurants
            .Include(r => r.Owner)
            .Where(r => r.OwnerId == ownerId && !r.IsDeleted)
            .ToListAsync();
        
        return mapper.Map<IEnumerable<OwnerRestaurantDto>>(restaurants);
    }

    public async Task<Restaurant?> GetRestaurantByIdAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var restaurants = await context.Restaurants
            .Where(r => r.OwnerId == ownerId && !r.IsDeleted)
            .ToListAsync();
        
        var restaurant = restaurants.FirstOrDefault(r => r.Id == restaurantId);
        return restaurant;
    }

    public async Task<Restaurant> CreateRestaurantAsync(CreateRestaurantDto dto, string ownerId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));
        
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var restaurant = mapper.Map<Restaurant>(dto);
        restaurant.OwnerId = ownerId;
        restaurant.Rate = 0;
        restaurant.CreatedAt = DateTime.UtcNow;
        restaurant.IsDeleted = false;

        context.Restaurants.Add(restaurant);
        await context.SaveChangesAsync();

        return restaurant;
    }
    
    public async Task<Restaurant> UpdateRestaurantAsync(string restaurantId, UpdateRestaurantDto dto, string ownerId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));
        
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var restaurant = await context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == restaurantId && r.OwnerId == ownerId && !r.IsDeleted);
 
        if (restaurant == null)
            throw new Exception("Restaurant not found or you don't have access to this restaurant.");

        mapper.Map(dto, restaurant);
        restaurant.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return restaurant;
    }
    
    public async Task<Restaurant> UpdateRestaurantImageAsync(string restaurantId, string imageUrl, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        if (string.IsNullOrEmpty(imageUrl))
            throw new ArgumentException("Image URL cannot be null or empty.", nameof(imageUrl));

        var restaurant = await context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == restaurantId && r.OwnerId == ownerId && !r.IsDeleted);

        if (restaurant == null)
            throw new Exception("Restaurant not found or you don't have access to this restaurant.");

        restaurant.ImageUrl = imageUrl;
        restaurant.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return restaurant;
    }
    
    public async Task DeleteRestaurantAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var restaurant = await context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == restaurantId && r.OwnerId == ownerId && !r.IsDeleted);

        if (restaurant == null)
            throw new Exception("Restaurant not found or you don't have access to this restaurant.");

        restaurant.IsDeleted = true;
        restaurant.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
    }

    public async Task<bool> IsRestaurantOwnerAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var restaurant = await context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == restaurantId && r.OwnerId == ownerId && !r.IsDeleted);

        return restaurant != null;
    }

    public async Task<OwnerDashboardDto> GetDashboardDataAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var restaurant = await context.Restaurants
            .Include(r => r.Orders)
            .Include(r => r.Menus)
            .FirstOrDefaultAsync(r => r.Id == restaurantId && r.OwnerId == ownerId && !r.IsDeleted);

        if (restaurant == null)
            throw new Exception("Restaurant not found.");

        var dashboard = new OwnerDashboardDto
        {
            RestaurantId = restaurantId,
            RestaurantName = restaurant.Name,
            TotalRevenue = await GetTotalRevenueAsync(restaurantId, ownerId),
            TodayRevenue = await GetTodayRevenueAsync(restaurantId, ownerId),
            TotalOrders = await GetTotalOrdersCountAsync(restaurantId, ownerId),
            TodayOrders = await GetTodayOrdersCountAsync(restaurantId, ownerId),
            ActiveReservations = await GetActiveReservationsCountAsync(restaurantId, ownerId),
            MenuItemCount = await GetMenuItemsCountAsync(restaurantId, ownerId),
            EmployeeCount = await GetEmployeeCountAsync(restaurantId, ownerId),
            PendingApplicationsCount = await GetPendingApplicationsCountAsync(restaurantId, ownerId),
            PendingReviewsCount = await GetPendingReviewsCountAsync(restaurantId, ownerId),
            AverageRating = await GetAverageRatingAsync(restaurantId),
            TopSellingItems = (await GetTopSellingItemsAsync(restaurantId, 5)).ToList()
        };

        return dashboard;
    }

    public async Task<OwnerStatisticsDto> GetStatisticsAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var orders = await context.Orders
            .Where(o => o.RestaurantId == restaurantId && !o.IsDeleted)
            .ToListAsync();

        var totalRevenue = orders.Sum(o => o.TotalAmount);
        var totalOrders = orders.Count;
        var avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
 
        var totalCustomers = await context.Orders
            .Where(o => o.RestaurantId == restaurantId && !o.IsDeleted)
            .Select(o => o.CustomerId)
            .Distinct()
            .CountAsync();

        
        var totalTables = await context.Tables
            .Where(t => t.RestaurantId == restaurantId && !t.IsDeleted)
            .CountAsync();

        var totalReviews = await context.Reviews
            .Where(r => r.RestaurantId == restaurantId && !r.IsDeleted)
            .CountAsync();

        return new OwnerStatisticsDto
        {
            TotalCustomers = totalCustomers,
            TotalOrders = totalOrders,
            TotalRevenue = totalRevenue,
            TotalEmployees = await GetEmployeeCountAsync(restaurantId, ownerId),
            TotalTables = totalTables,
            AvailableTables = await GetAvailableTablesCountAsync(restaurantId, ownerId),
            TotalMenuItems = await GetMenuItemsCountAsync(restaurantId, ownerId),
            AverageOrderValue = (double)avgOrderValue,
            AverageRating = await GetAverageRatingAsync(restaurantId),
            TotalReviews = totalReviews
        };
    }

    public async Task<IEnumerable<TopSellingItemDto>> GetTopSellingItemsAsync(string restaurantId, int count = 10)
    {
        var topItems = await context.OrderItems
            .Include(oi => oi.MenuItem)
            .Include(oi => oi.Order)
            .Where(oi => oi.Order.RestaurantId == restaurantId && !oi.IsDeleted && !oi.Order.IsDeleted)
            .GroupBy(oi => new { oi.MenuItemId, oi.MenuItem.Name, oi.MenuItem.Category })
            .Select(g => new TopSellingItemDto
            {
                MenuItemId = g.Key.MenuItemId,
                MenuItemName = g.Key.Name,
                Category = g.Key.Category ?? "Other",
                QuantitySold = g.Sum(oi => oi.Quantity),
                TotalRevenue = g.Sum(oi => oi.UnitPrice * oi.Quantity),
                Price = g.First().UnitPrice
            })
            .OrderByDescending(x => x.QuantitySold)
            .Take(count)
            .ToListAsync();

        return topItems;
    }

    public async Task<RevenueChartDto> GetRevenueChartDataAsync(string restaurantId, int days = 30)
    {
        var startDate = DateTime.UtcNow.Date.AddDays(-days);
        var orders = await context.Orders
            .Where(o => o.RestaurantId == restaurantId 
                && o.OrderDate >= startDate 
                && !o.IsDeleted)
            .ToListAsync();

        var dailyRevenue = orders
            .GroupBy(o => o.OrderDate.Date)
            .Select(g => new DailyRevenueDto
            {
                Date = g.Key,
                Revenue = g.Sum(o => o.TotalAmount),
                OrderCount = g.Count()
            })
            .OrderBy(d => d.Date)
            .ToList();

        var totalRevenue = dailyRevenue.Sum(d => d.Revenue);
        var avgRevenue = dailyRevenue.Any() ? totalRevenue / dailyRevenue.Count : 0;

        return new RevenueChartDto
        {
            DailyRevenue = dailyRevenue,
            TotalRevenue = totalRevenue,
            AverageDailyRevenue = avgRevenue
        };
    }

    public async Task<PaginatedResult<EmployeeDto>> GetEmployeesAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var query = context.Users
            .Include(u => u.EmployerRestaurant)
            .Where(u => u.EmployerRestaurantId == restaurantId && !u.IsDeleted);

        var totalCount = await query.CountAsync();

        var employees = await query
            .OrderBy(u => u.FullName)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        
        var employeeDtos = mapper.Map<List<EmployeeDto>>(employees);
       
        return new PaginatedResult<EmployeeDto>
        {
            Items = employeeDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<EmployeeDto?> GetEmployeeByIdAsync(string restaurantId, string employeeId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var employee = await context.Users
            .FirstOrDefaultAsync(u => u.Id == employeeId && u.EmployerRestaurantId == restaurantId && !u.IsDeleted);

        return employee != null ? mapper.Map<EmployeeDto>(employee) : null;
    }

    public async Task<EmployeeDto> CreateEmployeeAsync(string restaurantId, CreateEmployeeDto dto, string ownerId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        
        var existingUser = await context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (existingUser != null)
            throw new Exception("This email address is already in use.");

        var employee = mapper.Map<AppUser>(dto);
        employee.EmployerRestaurantId = restaurantId;
        employee.CreatedAt = DateTime.UtcNow;
        employee.IsDeleted = false;
        employee.EmailConfirmed = true;

       
        var nameParts = dto.FullName.Split(' ', 2);
        employee.FirstName = nameParts[0];
        employee.LastName = nameParts.Length > 1 ? nameParts[1] : "";

        context.Users.Add(employee);
        await context.SaveChangesAsync();

        return mapper.Map<EmployeeDto>(employee);
    }

    public async Task<EmployeeDto> UpdateEmployeeAsync(string restaurantId, string employeeId, UpdateEmployeeDto dto, string ownerId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var employee = await context.Users
            .FirstOrDefaultAsync(u => u.Id == employeeId && u.EmployerRestaurantId == restaurantId && !u.IsDeleted);

        if (employee == null)
            throw new Exception("Employee not found or you don't have access to this employee.");

    
        if (employee.Email != dto.Email)
        {
            var existingUser = await context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.Id != employeeId);
            if (existingUser != null)
                throw new Exception("This email address is already in use.");
        }

        mapper.Map(dto, employee);
        
   
        var nameParts = dto.FullName.Split(' ', 2);
        employee.FirstName = nameParts[0];
        employee.LastName = nameParts.Length > 1 ? nameParts[1] : "";
        
        employee.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return mapper.Map<EmployeeDto>(employee);
    }

    public async Task DeleteEmployeeAsync(string restaurantId, string employeeId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var employee = await context.Users
            .FirstOrDefaultAsync(u => u.Id == employeeId && u.EmployerRestaurantId == restaurantId && !u.IsDeleted);

        if (employee == null)
            throw new Exception("Employee not found or you don't have access to this employee.");

        employee.IsDeleted = true;
        employee.DeletedAt = DateTime.UtcNow;
        employee.DeletedBy = ownerId;

        await context.SaveChangesAsync();
    }

    public async Task<int> GetEmployeeCountAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        return await context.Users
            .CountAsync(u => u.EmployerRestaurantId == restaurantId && !u.IsDeleted);
    }

    public async Task<PaginatedResult<JobApplicationDto>> GetJobApplicationsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var query = context.JobApplications
            .Include(ja => ja.JobPosting)
                .ThenInclude(jp => jp.Restaurant)
            .Include(ja => ja.Applicant)
            .Where(ja => ja.JobPosting.RestaurantId == restaurantId && !ja.IsDeleted);

        var totalCount = await query.CountAsync();

        var applications = await query
            .OrderByDescending(ja => ja.ApplicationDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var applicationDtos = mapper.Map<List<JobApplicationDto>>(applications);

        return new PaginatedResult<JobApplicationDto>
        {
            Items = applicationDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<PaginatedResult<JobApplicationDto>> GetPendingJobApplicationsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var query = context.JobApplications
            .Include(ja => ja.JobPosting)
                .ThenInclude(jp => jp.Restaurant)
            .Include(ja => ja.Applicant)
            .Where(ja => ja.JobPosting.RestaurantId == restaurantId 
                && ja.Status == "Pending" 
                && !ja.IsDeleted);

        var totalCount = await query.CountAsync();

        var applications = await query
            .OrderByDescending(ja => ja.ApplicationDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var applicationDtos = mapper.Map<List<JobApplicationDto>>(applications);

        return new PaginatedResult<JobApplicationDto>
        {
            Items = applicationDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<JobApplicationDto?> GetJobApplicationByIdAsync(string applicationId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var application = await context.JobApplications
            .Include(ja => ja.JobPosting)
                .ThenInclude(jp => jp.Restaurant)
            .Include(ja => ja.Applicant)
            .Where(ja => ja.Id == applicationId && !ja.IsDeleted)
            .FirstOrDefaultAsync();

        if (application == null)
            return null;
        
        var isOwner = await IsRestaurantOwnerAsync(application.JobPosting.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this application.");

        return mapper.Map<JobApplicationDto>(application);
    }

    public async Task AcceptJobApplicationAsync(string applicationId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var application = await context.JobApplications
            .Include(ja => ja.JobPosting)
            .FirstOrDefaultAsync(ja => ja.Id == applicationId && !ja.IsDeleted);

        if (application == null)
            throw new Exception("Job application not found.");
        
        var isOwner = await IsRestaurantOwnerAsync(application.JobPosting.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this application.");

        application.Status = "Accepted";
        application.ReviewedDate = DateTime.UtcNow;
        application.ReviewedBy = ownerId;
        application.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
    }

    public async Task RejectJobApplicationAsync(string applicationId, string ownerId, string? rejectionReason = null)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var application = await context.JobApplications
            .Include(ja => ja.JobPosting)
            .FirstOrDefaultAsync(ja => ja.Id == applicationId && !ja.IsDeleted);

        if (application == null)
            throw new Exception("Job application not found.");

     
        var isOwner = await IsRestaurantOwnerAsync(application.JobPosting.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this application.");

        application.Status = "Rejected";
        application.ReviewedDate = DateTime.UtcNow;
        application.ReviewedBy = ownerId;
        application.ReviewNotes = rejectionReason;
        application.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
    }

    public async Task<int> GetPendingApplicationsCountAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        return await context.JobApplications
            .Include(ja => ja.JobPosting)
            .Where(ja => ja.JobPosting.RestaurantId == restaurantId 
                && ja.Status == "Pending" 
                && !ja.IsDeleted)
            .CountAsync();
    }

    public async Task<PaginatedResult<ReviewDto>> GetRestaurantReviewsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var query = context.Reviews
            .Include(r => r.Restaurant)
            .Include(r => r.Customer)
            .Where(r => r.RestaurantId == restaurantId && !r.IsDeleted);

        var totalCount = await query.CountAsync();

        var reviews = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var reviewDtos = mapper.Map<List<ReviewDto>>(reviews);

        return new PaginatedResult<ReviewDto>
        {
            Items = reviewDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<PaginatedResult<ReviewDto>> GetPendingReviewsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var query = context.Reviews
            .Include(r => r.Restaurant)
            .Include(r => r.Customer)
            .Where(r => r.RestaurantId == restaurantId 
                && r.Status == "Pending" 
                && !r.IsDeleted);

        var totalCount = await query.CountAsync();

        var reviews = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var reviewDtos = mapper.Map<List<ReviewDto>>(reviews);

        return new PaginatedResult<ReviewDto>
        {
            Items = reviewDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<ReviewDto?> GetReviewByIdAsync(string reviewId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var review = await context.Reviews
            .Include(r => r.Restaurant)
            .Include(r => r.Customer)
            .Where(r => r.Id == reviewId && !r.IsDeleted)
            .FirstOrDefaultAsync();

        if (review == null)
            return null;
        
        var isOwner = await IsRestaurantOwnerAsync(review.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this review.");

        return mapper.Map<ReviewDto>(review);
    }

    public async Task RespondToReviewAsync(string reviewId, string response, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        if (string.IsNullOrWhiteSpace(response))
            throw new ArgumentException("Response cannot be empty.", nameof(response));

        var review = await context.Reviews
            .Include(r => r.Restaurant)
            .FirstOrDefaultAsync(r => r.Id == reviewId && !r.IsDeleted);

        if (review == null)
            throw new Exception("Review not found.");
        
        var isOwner = await IsRestaurantOwnerAsync(review.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this review.");

        review.OwnerResponse = response;
        review.UpdatedAt = DateTime.UtcNow;
        review.UpdatedBy = ownerId;

        await context.SaveChangesAsync();
    }

    public async Task ReportReviewAsync(string reviewId, string reason, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Report reason cannot be empty.", nameof(reason));

        var review = await context.Reviews
            .Include(r => r.Restaurant)
            .FirstOrDefaultAsync(r => r.Id == reviewId && !r.IsDeleted);

        if (review == null)
            throw new Exception("Review not found.");
        
        var isOwner = await IsRestaurantOwnerAsync(review.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this review.");
        
        review.IsReported = true;
        review.ReportReason = reason;
        review.ReportedAt = DateTime.UtcNow;
        review.ReportedByOwnerId = ownerId;
        review.UpdatedAt = DateTime.UtcNow;
        review.UpdatedBy = ownerId;

        await context.SaveChangesAsync();
    }

    public async Task<int> GetPendingReviewsCountAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        return await context.Reviews
            .Where(r => r.RestaurantId == restaurantId 
                && r.Status == "Pending" 
                && !r.IsDeleted)
            .CountAsync();
    }

    public async Task<double> GetAverageRatingAsync(string restaurantId)
    {
        var approvedReviews = await context.Reviews
            .Where(r => r.RestaurantId == restaurantId 
                && r.Status == "Approved" 
                && !r.IsDeleted)
            .ToListAsync();

        if (!approvedReviews.Any())
            return 0;

        return approvedReviews.Average(r => r.Rating);
    }

    public async Task<PaginatedResult<OrderDto>> GetRestaurantOrdersAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var query = context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.Customer)
            .Include(o => o.Table)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Where(o => o.RestaurantId == restaurantId && !o.IsDeleted);

        var totalCount = await query.CountAsync();

        var orders = await query
            .OrderByDescending(o => o.OrderDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var orderDtos = mapper.Map<List<OrderDto>>(orders);

        return new PaginatedResult<OrderDto>
        {
            Items = orderDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<PaginatedResult<OrderDto>> GetOrdersByStatusAsync(string restaurantId, OrderStatus status, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var query = context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.Customer)
            .Include(o => o.Table)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Where(o => o.RestaurantId == restaurantId 
                && o.Status == status 
                && !o.IsDeleted);

        var totalCount = await query.CountAsync();

        var orders = await query
            .OrderByDescending(o => o.OrderDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var orderDtos = mapper.Map<List<OrderDto>>(orders);

        return new PaginatedResult<OrderDto>
        {
            Items = orderDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<OrderDto?> GetOrderByIdAsync(string orderId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var order = await context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.Customer)
            .Include(o => o.Table)
            .Include(o => o.DeliveryPerson)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Where(o => o.Id == orderId && !o.IsDeleted)
            .FirstOrDefaultAsync();

        if (order == null)
            return null;

      
        var isOwner = await IsRestaurantOwnerAsync(order.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this order.");

        return mapper.Map<OrderDto>(order);
    }

    public async Task<OrderDto> UpdateOrderStatusAsync(string orderId, OrderStatus newStatus, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var order = await context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.Customer)
            .Include(o => o.Table)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .FirstOrDefaultAsync(o => o.Id == orderId && !o.IsDeleted);

        if (order == null)
            throw new Exception("Order not found.");


        var isOwner = await IsRestaurantOwnerAsync(order.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this order.");

        order.Status = newStatus;
        
        
        if (newStatus == OrderStatus.Completed || newStatus == OrderStatus.Delivered)
        {
            order.CompletedAt = DateTime.UtcNow;
        }

        order.UpdatedAt = DateTime.UtcNow;
        order.UpdatedBy = ownerId;

        await context.SaveChangesAsync();

        return mapper.Map<OrderDto>(order);
    }

    public async Task<decimal> GetTotalRevenueAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var totalRevenue = await context.Orders
            .Where(o => o.RestaurantId == restaurantId 
                && (o.Status == OrderStatus.Completed || o.Status == OrderStatus.Delivered)
                && !o.IsDeleted)
            .SumAsync(o => o.TotalAmount);

        return totalRevenue;
    }

    public async Task<decimal> GetTodayRevenueAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var today = DateTime.UtcNow.Date;
        var todayRevenue = await context.Orders
            .Where(o => o.RestaurantId == restaurantId 
                && o.OrderDate.Date == today
                && (o.Status == OrderStatus.Completed || o.Status == OrderStatus.Delivered)
                && !o.IsDeleted)
            .SumAsync(o => o.TotalAmount);

        return todayRevenue;
    }

    public async Task<int> GetTotalOrdersCountAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        return await context.Orders
            .Where(o => o.RestaurantId == restaurantId && !o.IsDeleted)
            .CountAsync();
    }

    public async Task<int> GetTodayOrdersCountAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var today = DateTime.UtcNow.Date;
        return await context.Orders
            .Where(o => o.RestaurantId == restaurantId 
                && o.OrderDate.Date == today
                && !o.IsDeleted)
            .CountAsync();
    }

    public async Task<PaginatedResult<ReservationDto>> GetRestaurantReservationsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var query = context.Reservations
            .Include(r => r.Restaurant)
            .Include(r => r.Table)
            .Where(r => r.RestaurantId == restaurantId && !r.IsDeleted)
            .OrderByDescending(r => r.ReservationDate);

        var totalCount = await query.CountAsync();
        var reservations = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var reservationDtos = mapper.Map<List<ReservationDto>>(reservations);

        return new PaginatedResult<ReservationDto>
        {
            Items = reservationDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<PaginatedResult<ReservationDto>> GetReservationsByStatusAsync(string restaurantId, ReservationStatus status, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var query = context.Reservations
            .Include(r => r.Restaurant)
            .Include(r => r.Table)
            .Where(r => r.RestaurantId == restaurantId && r.Status == status && !r.IsDeleted)
            .OrderByDescending(r => r.ReservationDate);

        var totalCount = await query.CountAsync();
        var reservations = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var reservationDtos = mapper.Map<List<ReservationDto>>(reservations);

        return new PaginatedResult<ReservationDto>
        {
            Items = reservationDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<ReservationDto?> GetReservationByIdAsync(string reservationId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var reservation = await context.Reservations
            .Include(r => r.Restaurant)
            .Include(r => r.Table)
            .FirstOrDefaultAsync(r => r.Id == reservationId && !r.IsDeleted);

        if (reservation == null)
            return null;

        var isOwner = await IsRestaurantOwnerAsync(reservation.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this reservation.");

        return mapper.Map<ReservationDto>(reservation);
    }

    public async Task<ReservationDto> UpdateReservationStatusAsync(string reservationId, ReservationStatus newStatus, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var reservation = await context.Reservations
            .Include(r => r.Restaurant)
            .Include(r => r.Table)
            .FirstOrDefaultAsync(r => r.Id == reservationId && !r.IsDeleted);

        if (reservation == null)
            throw new Exception("Reservation not found.");

        var isOwner = await IsRestaurantOwnerAsync(reservation.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this reservation.");

        reservation.Status = newStatus;
        reservation.UpdatedAt = DateTime.UtcNow;
        reservation.UpdatedBy = ownerId;

        await context.SaveChangesAsync();

        return mapper.Map<ReservationDto>(reservation);
    }

    public async Task<int> GetActiveReservationsCountAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        return await context.Reservations
            .Where(r => r.RestaurantId == restaurantId 
                && (r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.Confirmed)
                && !r.IsDeleted)
            .CountAsync();
    }

    public async Task<IEnumerable<ReservationDto>> GetTodayReservationsAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var reservations = await context.Reservations
            .Include(r => r.Restaurant)
            .Include(r => r.Table)
            .Where(r => r.RestaurantId == restaurantId 
                && r.ReservationDate >= DateTime.UtcNow.Date 
                && r.ReservationDate < DateTime.UtcNow.Date.AddDays(1)
                && !r.IsDeleted)
            .OrderBy(r => r.ReservationDate)
            .ToListAsync();

        return mapper.Map<List<ReservationDto>>(reservations);
    }

    public async Task<IEnumerable<MenuDto>> GetRestaurantMenusAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var menus = await context.Menus
            .Where(m => m.RestaurantId == restaurantId && !m.IsDeleted)
            .Include(m => m.MenuItems)
            .ToListAsync();

        return mapper.Map<List<MenuDto>>(menus);
    }

    public async Task<MenuDto?> GetMenuByIdAsync(string menuId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var menu = await context.Menus
            .Where(m => m.Id == menuId && !m.IsDeleted)
            .Include(m => m.MenuItems)
            .FirstOrDefaultAsync();

        if (menu == null)
            return null;

        var isOwner = await IsRestaurantOwnerAsync(menu.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this menu.");

        return mapper.Map<MenuDto>(menu);
    }

    public async Task<MenuDto> CreateMenuAsync(string restaurantId, CreateMenuDto dto, string ownerId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var restaurant = await context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == restaurantId && !r.IsDeleted);

        if (restaurant == null)
            throw new Exception("Restaurant not found.");

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var menu = mapper.Map<Menu>(dto);
        menu.RestaurantId = restaurantId;
        menu.CreatedAt = DateTime.UtcNow;
        menu.CreatedBy = ownerId;
        menu.IsDeleted = false;

        context.Menus.Add(menu);
        await context.SaveChangesAsync();

        return mapper.Map<MenuDto>(menu);
    }

    public async Task<MenuDto> UpdateMenuAsync(string menuId, UpdateMenuDto dto, string ownerId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var menu = await context.Menus
            .FirstOrDefaultAsync(m => m.Id == menuId && !m.IsDeleted);

        if (menu == null)
            throw new Exception("Menu not found.");

        var isOwner = await IsRestaurantOwnerAsync(menu.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");
        mapper.Map(dto, menu);
        menu.UpdatedAt = DateTime.UtcNow;
        menu.UpdatedBy = ownerId;

        await context.SaveChangesAsync();

        return mapper.Map<MenuDto>(menu);
    }

    public async Task DeleteMenuAsync(string menuId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var menu = await context.Menus
            .FirstOrDefaultAsync(m => m.Id == menuId && !m.IsDeleted);

        if (menu == null)
            throw new Exception("Menu not found.");

        var isOwner = await IsRestaurantOwnerAsync(menu.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this menu.");

        menu.IsDeleted = true;
        menu.DeletedAt = DateTime.UtcNow;
        menu.DeletedBy = ownerId;

        await context.SaveChangesAsync();
    }

    public async Task<PaginatedResult<MenuItemDto>> GetMenuItemsAsync(string menuId, string ownerId, int pageNumber = 1, int pageSize = 20)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var menu = await context.Menus
            .Include(m => m.Restaurant)
            .FirstOrDefaultAsync(m => m.Id == menuId && !m.IsDeleted);

        if (menu == null)
            throw new Exception("Menu not found.");

        var isOwner = await IsRestaurantOwnerAsync(menu.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this menu.");

        var query = context.MenuItems
            .Include(mi => mi.Menu)
            .Where(mi => mi.MenuId == menuId && !mi.IsDeleted)
            .OrderBy(mi => mi.Category)
            .ThenBy(mi => mi.Name);

        var totalCount = await query.CountAsync();
        var menuItems = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var menuItemDtos = mapper.Map<List<MenuItemDto>>(menuItems);

        return new PaginatedResult<MenuItemDto>
        {
            Items = menuItemDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<MenuItemDto?> GetMenuItemByIdAsync(string menuItemId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var menuItem = await context.MenuItems
            .Include(mi => mi.Menu)
                .ThenInclude(m => m.Restaurant)
            .FirstOrDefaultAsync(mi => mi.Id == menuItemId && !mi.IsDeleted);

        if (menuItem == null)
            return null;

        var isOwner = await IsRestaurantOwnerAsync(menuItem.Menu.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this menu item.");

        return mapper.Map<MenuItemDto>(menuItem);
    }

    public async Task<MenuItemDto> CreateMenuItemAsync(string menuId, CreateMenuItemDto dto, string ownerId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var menu = await context.Menus
            .Include(m => m.Restaurant)
            .FirstOrDefaultAsync(m => m.Id == menuId && !m.IsDeleted);

        if (menu == null)
            throw new Exception("Menu not found.");

        var isOwner = await IsRestaurantOwnerAsync(menu.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this menu.");

        var menuItem = mapper.Map<MenuItem>(dto);
        menuItem.MenuId = menuId;
        menuItem.CreatedAt = DateTime.UtcNow;
        menuItem.CreatedBy = ownerId;
        menuItem.IsDeleted = false;

        context.MenuItems.Add(menuItem);
        await context.SaveChangesAsync();

        menuItem = await context.MenuItems
            .Include(mi => mi.Menu)
            .FirstAsync(mi => mi.Id == menuItem.Id);

        return mapper.Map<MenuItemDto>(menuItem);
    }

    public async Task<MenuItemDto> UpdateMenuItemAsync(string menuItemId, UpdateMenuItemDto dto, string ownerId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var menuItem = await context.MenuItems
            .Include(mi => mi.Menu)
                .ThenInclude(m => m.Restaurant)
            .FirstOrDefaultAsync(mi => mi.Id == menuItemId && !mi.IsDeleted);

        if (menuItem == null)
            throw new Exception("Menu item not found.");

        var isOwner = await IsRestaurantOwnerAsync(menuItem.Menu.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this menu item.");

        mapper.Map(dto, menuItem);
        menuItem.UpdatedAt = DateTime.UtcNow;
        menuItem.UpdatedBy = ownerId;

        await context.SaveChangesAsync();

        return mapper.Map<MenuItemDto>(menuItem);
    }

    public async Task DeleteMenuItemAsync(string menuItemId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var menuItem = await context.MenuItems
            .Include(mi => mi.Menu)
                .ThenInclude(m => m.Restaurant)
            .FirstOrDefaultAsync(mi => mi.Id == menuItemId && !mi.IsDeleted);

        if (menuItem == null)
            throw new Exception("Menu item not found.");

        var isOwner = await IsRestaurantOwnerAsync(menuItem.Menu.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this menu item.");

        menuItem.IsDeleted = true;
        menuItem.DeletedAt = DateTime.UtcNow;
        menuItem.DeletedBy = ownerId;

        await context.SaveChangesAsync();
    }

    public async Task UpdateMenuItemAvailabilityAsync(string menuItemId, bool isAvailable, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var menuItem = await context.MenuItems
            .Include(mi => mi.Menu)
                .ThenInclude(m => m.Restaurant)
            .FirstOrDefaultAsync(mi => mi.Id == menuItemId && !mi.IsDeleted);

        if (menuItem == null)
            throw new Exception("Menu item not found.");

        var isOwner = await IsRestaurantOwnerAsync(menuItem.Menu.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this menu item.");

        menuItem.IsAvailable = isAvailable;
        menuItem.UpdatedAt = DateTime.UtcNow;
        menuItem.UpdatedBy = ownerId;

        await context.SaveChangesAsync();
    }

    public async Task<int> GetMenuItemsCountAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        return await context.MenuItems
            .Include(mi => mi.Menu)
            .Where(mi => mi.Menu.RestaurantId == restaurantId && !mi.IsDeleted)
            .CountAsync();
    }

    public async Task<IEnumerable<TableDto>> GetRestaurantTablesAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var tables = await context.Tables
            .Where(t => t.RestaurantId == restaurantId && !t.IsDeleted)
            .OrderBy(t => t.TableNumber)
            .ToListAsync();

        return mapper.Map<List<TableDto>>(tables);
    }

    public async Task<TableDto?> GetTableByIdAsync(string tableId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var table = await context.Tables
            .FirstOrDefaultAsync(t => t.Id == tableId && !t.IsDeleted);

        if (table == null)
            return null;

        var isOwner = await IsRestaurantOwnerAsync(table.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this table.");

        return mapper.Map<TableDto>(table);
    }

    public async Task<TableDto> CreateTableAsync(string restaurantId, CreateTableDto dto, string ownerId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

       
        var existingTable = await context.Tables
            .FirstOrDefaultAsync(t => t.RestaurantId == restaurantId 
                && t.TableNumber == dto.TableNumber 
                && !t.IsDeleted);

        if (existingTable != null)
            throw new Exception($"Table number {dto.TableNumber} already exists in this restaurant.");

        var table = mapper.Map<Table>(dto);
        table.RestaurantId = restaurantId;
        table.CreatedAt = DateTime.UtcNow;
        table.CreatedBy = ownerId;
        table.IsDeleted = false;
        table.Status = TableStatus.Available;
        
        if (!string.IsNullOrEmpty(dto.Location) && Enum.TryParse<TableLocation>(dto.Location, true, out var location))
            table.Location = location;

        context.Tables.Add(table);
        await context.SaveChangesAsync();

        return mapper.Map<TableDto>(table);
    }

    public async Task<TableDto> UpdateTableAsync(string tableId, UpdateTableDto dto, string ownerId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var table = await context.Tables
            .FirstOrDefaultAsync(t => t.Id == tableId && !t.IsDeleted);

        if (table == null)
            throw new Exception("Table not found.");

        var isOwner = await IsRestaurantOwnerAsync(table.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this table.");

      
        if (table.TableNumber != dto.TableNumber)
        {
            var existingTable = await context.Tables
                .FirstOrDefaultAsync(t => t.RestaurantId == table.RestaurantId 
                    && t.TableNumber == dto.TableNumber 
                    && t.Id != tableId
                    && !t.IsDeleted);

            if (existingTable != null)
                throw new Exception($"Table number {dto.TableNumber} already exists in this restaurant.");
        }

        table.TableNumber = dto.TableNumber;
        table.Capacity = dto.Capacity;
        
        if (!string.IsNullOrEmpty(dto.Location) && Enum.TryParse<TableLocation>(dto.Location, true, out var location))
            table.Location = location;
        
        if (!string.IsNullOrEmpty(dto.Status) && Enum.TryParse<TableStatus>(dto.Status, true, out var status))
            table.Status = status;

        table.UpdatedAt = DateTime.UtcNow;
        table.UpdatedBy = ownerId;

        await context.SaveChangesAsync();

        return mapper.Map<TableDto>(table);
    }

    public async Task DeleteTableAsync(string tableId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var table = await context.Tables
            .FirstOrDefaultAsync(t => t.Id == tableId && !t.IsDeleted);

        if (table == null)
            throw new Exception("Table not found.");

        var isOwner = await IsRestaurantOwnerAsync(table.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this table.");

        table.IsDeleted = true;
        table.DeletedAt = DateTime.UtcNow;
        table.DeletedBy = ownerId;

        await context.SaveChangesAsync();
    }

    public async Task<TableDto> UpdateTableStatusAsync(string tableId, TableStatus newStatus, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var table = await context.Tables
            .FirstOrDefaultAsync(t => t.Id == tableId && !t.IsDeleted);

        if (table == null)
            throw new Exception("Table not found.");

        var isOwner = await IsRestaurantOwnerAsync(table.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this table.");

        table.Status = newStatus;
        table.UpdatedAt = DateTime.UtcNow;
        table.UpdatedBy = ownerId;

        await context.SaveChangesAsync();

        return mapper.Map<TableDto>(table);
    }

    public async Task<int> GetAvailableTablesCountAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        return await context.Tables
            .Where(t => t.RestaurantId == restaurantId 
                && t.Status == TableStatus.Available 
                && !t.IsDeleted)
            .CountAsync();
    }

    public async Task<SalesReportDto> GetSalesReportAsync(string restaurantId, DateTime startDate, DateTime endDate, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

  
        var orders = await context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Where(o => o.RestaurantId == restaurantId 
                && o.OrderDate >= startDate 
                && o.OrderDate <= endDate
                && (o.Status == OrderStatus.Completed || o.Status == OrderStatus.Delivered)
                && !o.IsDeleted)
            .ToListAsync();

      
        var totalRevenue = orders.Sum(o => o.TotalAmount);
        var totalOrders = orders.Count;
        var averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        var dailySales = orders
            .GroupBy(o => o.OrderDate.Date)
            .Select(g => new DailyRevenueDto
            {
                Date = g.Key,
                Revenue = g.Sum(o => o.TotalAmount),
                OrderCount = g.Count()
            })
            .OrderBy(d => d.Date)
            .ToList();

       
        var categorySales = await GetCategorySalesAsync(restaurantId, startDate, endDate, ownerId);

        
        var topProducts = orders
            .SelectMany(o => o.OrderItems)
            .GroupBy(oi => new { oi.MenuItemId, oi.MenuItem.Name, oi.MenuItem.Category })
            .Select(g => new TopSellingItemDto
            {
                MenuItemId = g.Key.MenuItemId,
                MenuItemName = g.Key.Name,
                Category = g.Key.Category ?? "Other",
                QuantitySold = g.Sum(oi => oi.Quantity),
                TotalRevenue = g.Sum(oi => oi.UnitPrice * oi.Quantity),
                Price = g.First().UnitPrice
            })
            .OrderByDescending(x => x.TotalRevenue)
            .Take(10)
            .ToList();

        return new SalesReportDto
        {
            StartDate = startDate,
            EndDate = endDate,
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            AverageOrderValue = averageOrderValue,
            CategorySales = categorySales.ToList(),
            DailySales = dailySales,
            TopProducts = topProducts
        };
    }

    public async Task<IEnumerable<OrderDto>> GetOrdersByDateRangeAsync(string restaurantId, DateTime startDate, DateTime endDate, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var orders = await context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.Customer)
            .Include(o => o.Table)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Where(o => o.RestaurantId == restaurantId 
                && o.OrderDate >= startDate 
                && o.OrderDate <= endDate
                && !o.IsDeleted)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

       
        return mapper.Map<List<OrderDto>>(orders);
    }

    public async Task<IEnumerable<CategorySalesDto>> GetCategorySalesAsync(string restaurantId, DateTime startDate, DateTime endDate, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

    
        var orders = await context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Where(o => o.RestaurantId == restaurantId 
                && o.OrderDate >= startDate 
                && o.OrderDate <= endDate
                && (o.Status == OrderStatus.Completed || o.Status == OrderStatus.Delivered)
                && !o.IsDeleted)
            .ToListAsync();


        var totalRevenue = orders.Sum(o => o.TotalAmount);

    
        var categorySales = orders
            .SelectMany(o => o.OrderItems)
            .Where(oi => !oi.IsDeleted)
            .GroupBy(oi => oi.MenuItem.Category ?? "Other")
            .Select(g => new CategorySalesDto
            {
                Category = g.Key,
                ItemsSold = g.Sum(oi => oi.Quantity),
                Revenue = g.Sum(oi => oi.UnitPrice * oi.Quantity),
                Percentage = totalRevenue > 0 ? (g.Sum(oi => oi.UnitPrice * oi.Quantity) / totalRevenue) * 100 : 0
            })
            .OrderByDescending(c => c.Revenue)
            .ToList();

        return categorySales;
    }

    #region Reward Management

    public async Task<PaginatedResult<RewardDto>> GetRestaurantRewardsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        if (pageNumber < 1)
            throw new ArgumentException("Page number must be greater than 0.", nameof(pageNumber));

        if (pageSize < 1 || pageSize > 100)
            throw new ArgumentException("Page size must be between 1 and 100.", nameof(pageSize));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var query = context.Rewards
            .Include(r => r.Restaurant)
            .Where(r => r.RestaurantId == restaurantId && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAt);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var rewardDtos = mapper.Map<List<RewardDto>>(items);

        return new PaginatedResult<RewardDto>
        {
            Items = rewardDtos,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<RewardDto?> GetRewardByIdAsync(string rewardId, string ownerId)
    {
        if (string.IsNullOrEmpty(rewardId))
            throw new ArgumentException("Reward ID cannot be null or empty.", nameof(rewardId));

        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var reward = await context.Rewards
            .Include(r => r.Restaurant)
            .FirstOrDefaultAsync(r => r.Id == rewardId && !r.IsDeleted);

        if (reward == null)
            return null;

        var isOwner = await IsRestaurantOwnerAsync(reward.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this reward.");

        return mapper.Map<RewardDto>(reward);
    }

    public async Task<RewardDto> CreateRewardAsync(string restaurantId, CreateRewardDto dto, string ownerId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        if (dto.PointsRequired <= 0)
            throw new ArgumentException("Points required must be greater than 0.");

        if (dto.DiscountAmount.HasValue && dto.DiscountAmount <= 0)
            throw new ArgumentException("Discount amount must be greater than 0.");

        if (dto.DiscountPercentage.HasValue && (dto.DiscountPercentage <= 0 || dto.DiscountPercentage > 100))
            throw new ArgumentException("Discount percentage must be between 1 and 100.", nameof(dto.DiscountPercentage));

        var reward = mapper.Map<Reward>(dto);
        reward.Id = Guid.NewGuid().ToString();
        reward.RestaurantId = restaurantId;
        reward.IsActive = true;
        reward.CurrentRedemptions = 0;
        reward.IsDeleted = false;
        reward.CreatedAt = DateTime.UtcNow;

        context.Rewards.Add(reward);
        await context.SaveChangesAsync();

        return await GetRewardByIdAsync(reward.Id, ownerId) 
               ?? throw new InvalidOperationException("Failed to retrieve created reward.");
    }

    public async Task<RewardDto> UpdateRewardAsync(string rewardId, UpdateRewardDto dto, string ownerId)
    {
        if (string.IsNullOrEmpty(rewardId))
            throw new ArgumentException("Reward ID cannot be null or empty.", nameof(rewardId));

        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        var reward = await context.Rewards
            .FirstOrDefaultAsync(r => r.Id == rewardId && !r.IsDeleted);

        if (reward == null)
            throw new InvalidOperationException("Reward not found.");

        var isOwner = await IsRestaurantOwnerAsync(reward.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this reward.");

        if (dto.PointsRequired <= 0)
            throw new ArgumentException("Points required must be greater than 0.");

        if (dto.DiscountAmount.HasValue && dto.DiscountAmount <= 0)
            throw new ArgumentException("Discount amount must be greater than 0.");

        if (dto.DiscountPercentage.HasValue && (dto.DiscountPercentage <= 0 || dto.DiscountPercentage > 100))
            throw new ArgumentException("Discount percentage must be between 1 and 100.", nameof(dto.DiscountPercentage));

        mapper.Map(dto, reward);
        reward.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return await GetRewardByIdAsync(rewardId, ownerId) 
               ?? throw new InvalidOperationException("Failed to retrieve updated reward.");
    }

    public async Task DeleteRewardAsync(string rewardId, string ownerId)
    {
        if (string.IsNullOrEmpty(rewardId))
            throw new ArgumentException("Reward ID cannot be null or empty.", nameof(rewardId));

        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var reward = await context.Rewards
            .FirstOrDefaultAsync(r => r.Id == rewardId && !r.IsDeleted);

        if (reward == null)
            throw new InvalidOperationException("Reward not found.");

        var isOwner = await IsRestaurantOwnerAsync(reward.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this reward.");

        reward.IsDeleted = true;
        reward.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
    }

    public async Task ToggleRewardActiveStatusAsync(string rewardId, string ownerId)
    {
        if (string.IsNullOrEmpty(rewardId))
            throw new ArgumentException("Reward ID cannot be null or empty.", nameof(rewardId));

        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var reward = await context.Rewards
            .FirstOrDefaultAsync(r => r.Id == rewardId && !r.IsDeleted);

        if (reward == null)
            throw new InvalidOperationException("Reward not found.");

        var isOwner = await IsRestaurantOwnerAsync(reward.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this reward.");

        reward.IsActive = !reward.IsActive;
        reward.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
    }

    #endregion
}
