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
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace RestaurantManagment.Infrastructure.Services;

public class OwnerService(IAppDbContext _context, IMapper _mapper): IOwnerService
{
    public async Task<IEnumerable<Restaurant>> GetOwnerRestaurantsAsync(string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));
            
        var restaurants = _context.Restaurants
            .Where(r => r.OwnerId == ownerId && !r.IsDeleted)
            .ToList();
        
        return await Task.FromResult(restaurants);
    }

    public Task<Restaurant?> GetRestaurantByIdAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var restaurants = _context.Restaurants
            .Where(r => r.OwnerId == ownerId)
            .ToList();
        
        var restaurant = restaurants.FirstOrDefault(r => r.Id == restaurantId  && !r.IsDeleted);
        return Task.FromResult(restaurant);
    }

    public async Task<Restaurant> CreateRestaurantAsync(CreateRestaurantDto dto, string ownerId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));
        
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var restaurant = _mapper.Map<Restaurant>(dto);
        restaurant.OwnerId = ownerId;
        restaurant.Rate = 0;
        restaurant.CreatedAt = DateTime.UtcNow;
        restaurant.IsDeleted = false;

        _context.Restaurants.Add(restaurant);
        await _context.SaveChangesAsync();

        return restaurant;
    }
    
    public async Task<Restaurant> UpdateRestaurantAsync(string restaurantId, UpdateRestaurantDto dto, string ownerId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));
        
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var restaurant = await _context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == restaurantId && r.OwnerId == ownerId && !r.IsDeleted);
 
        if (restaurant == null)
            throw new Exception("Restaurant not found or you don't have access to this restaurant.");

        _mapper.Map(dto, restaurant);
        restaurant.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return restaurant;
    }
    
    public async Task DeleteRestaurantAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var restaurant = await _context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == restaurantId && r.OwnerId == ownerId && !r.IsDeleted);

        if (restaurant == null)
            throw new Exception("Restaurant not found or you don't have access to this restaurant.");

        restaurant.IsDeleted = true;
        restaurant.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task<bool> IsRestaurantOwnerAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var restaurant = await _context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == restaurantId && r.OwnerId == ownerId && !r.IsDeleted);

        return restaurant != null;
    }

    public async Task<OwnerDashboardDto> GetDashboardDataAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var restaurant = await _context.Restaurants
            .Include(r => r.Orders)
            .Include(r => r.Menus)
            .FirstOrDefaultAsync(r => r.Id == restaurantId && r.OwnerId == ownerId && !r.IsDeleted);

        if (restaurant == null)
            throw new Exception("Restaurant not found.");

        var dashboard = new OwnerDashboardDto
        {
            RestaurantId = int.Parse(restaurantId),
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

        var orders = await _context.Orders
            .Where(o => o.RestaurantId == restaurantId && !o.IsDeleted)
            .ToListAsync();

        var totalRevenue = orders.Sum(o => o.TotalAmount);
        var totalOrders = orders.Count;
        var avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return new OwnerStatisticsDto
        {
            TotalOrders = totalOrders,
            TotalRevenue = totalRevenue,
            TotalEmployees = await GetEmployeeCountAsync(restaurantId, ownerId),
            TotalMenuItems = await GetMenuItemsCountAsync(restaurantId, ownerId),
            AvailableTables = await GetAvailableTablesCountAsync(restaurantId, ownerId),
            AverageOrderValue = (double)avgOrderValue,
            AverageRating = await GetAverageRatingAsync(restaurantId)
        };
    }

    public async Task<IEnumerable<TopSellingItemDto>> GetTopSellingItemsAsync(string restaurantId, int count = 10)
    {
        var topItems = await _context.OrderItems
            .Include(oi => oi.MenuItem)
            .Include(oi => oi.Order)
            .Where(oi => oi.Order.RestaurantId == restaurantId && !oi.IsDeleted && !oi.Order.IsDeleted)
            .GroupBy(oi => new { oi.MenuItemId, oi.MenuItem.Name, oi.MenuItem.Category })
            .Select(g => new TopSellingItemDto
            {
                MenuItemId = int.Parse(g.Key.MenuItemId),
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
        var orders = await _context.Orders
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

        var query = _context.Users
            .Where(u => u.EmployerRestaurantId == restaurantId && !u.IsDeleted);

        var totalCount = await query.CountAsync();

        var employees = await query
            .OrderBy(u => u.FullName)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var employeeDtos = _mapper.Map<List<EmployeeDto>>(employees);

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

        var employee = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == employeeId && u.EmployerRestaurantId == restaurantId && !u.IsDeleted);

        return employee != null ? _mapper.Map<EmployeeDto>(employee) : null;
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

        
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (existingUser != null)
            throw new Exception("This email address is already in use.");

        var employee = _mapper.Map<AppUser>(dto);
        employee.EmployerRestaurantId = restaurantId;
        employee.CreatedAt = DateTime.UtcNow;
        employee.IsDeleted = false;
        employee.EmailConfirmed = true;

       
        var nameParts = dto.FullName.Split(' ', 2);
        employee.FirstName = nameParts[0];
        employee.LastName = nameParts.Length > 1 ? nameParts[1] : "";

        _context.Users.Add(employee);
        await _context.SaveChangesAsync();

        return _mapper.Map<EmployeeDto>(employee);
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

        var employee = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == employeeId && u.EmployerRestaurantId == restaurantId && !u.IsDeleted);

        if (employee == null)
            throw new Exception("Employee not found or you don't have access to this employee.");

    
        if (employee.Email != dto.Email)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.Id != employeeId);
            if (existingUser != null)
                throw new Exception("This email address is already in use.");
        }

        _mapper.Map(dto, employee);
        
   
        var nameParts = dto.FullName.Split(' ', 2);
        employee.FirstName = nameParts[0];
        employee.LastName = nameParts.Length > 1 ? nameParts[1] : "";
        
        employee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<EmployeeDto>(employee);
    }

    public async Task DeleteEmployeeAsync(string restaurantId, string employeeId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var employee = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == employeeId && u.EmployerRestaurantId == restaurantId && !u.IsDeleted);

        if (employee == null)
            throw new Exception("Employee not found or you don't have access to this employee.");

        employee.IsDeleted = true;
        employee.DeletedAt = DateTime.UtcNow;
        employee.DeletedBy = ownerId;

        await _context.SaveChangesAsync();
    }

    public async Task<int> GetEmployeeCountAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        return await _context.Users
            .CountAsync(u => u.EmployerRestaurantId == restaurantId && !u.IsDeleted);
    }

    public async Task<PaginatedResult<JobApplicationDto>> GetJobApplicationsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var query = _context.JobApplications
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

        var applicationDtos = _mapper.Map<List<JobApplicationDto>>(applications);

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

        var query = _context.JobApplications
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

        var applicationDtos = _mapper.Map<List<JobApplicationDto>>(applications);

        return new PaginatedResult<JobApplicationDto>
        {
            Items = applicationDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<JobApplicationDto?> GetJobApplicationByIdAsync(int applicationId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var application = await _context.JobApplications
            .Include(ja => ja.JobPosting)
                .ThenInclude(jp => jp.Restaurant)
            .Include(ja => ja.Applicant)
            .Where(ja => ja.Id == applicationId.ToString() && !ja.IsDeleted)
            .FirstOrDefaultAsync();

        if (application == null)
            return null;
        
        var isOwner = await IsRestaurantOwnerAsync(application.JobPosting.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this application.");

        return _mapper.Map<JobApplicationDto>(application);
    }

    public async Task AcceptJobApplicationAsync(int applicationId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var application = await _context.JobApplications
            .Include(ja => ja.JobPosting)
            .FirstOrDefaultAsync(ja => ja.Id == applicationId.ToString() && !ja.IsDeleted);

        if (application == null)
            throw new Exception("Job application not found.");
        
        var isOwner = await IsRestaurantOwnerAsync(application.JobPosting.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this application.");

        application.Status = "Accepted";
        application.ReviewedDate = DateTime.UtcNow;
        application.ReviewedBy = ownerId;
        application.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task RejectJobApplicationAsync(int applicationId, string ownerId, string? rejectionReason = null)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var application = await _context.JobApplications
            .Include(ja => ja.JobPosting)
            .FirstOrDefaultAsync(ja => ja.Id == applicationId.ToString() && !ja.IsDeleted);

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

        await _context.SaveChangesAsync();
    }

    public async Task<int> GetPendingApplicationsCountAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        return await _context.JobApplications
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

        var query = _context.Reviews
            .Include(r => r.Restaurant)
            .Include(r => r.Customer)
            .Where(r => r.RestaurantId == restaurantId && !r.IsDeleted);

        var totalCount = await query.CountAsync();

        var reviews = await query
            .OrderByDescending(r => r.CreatedAt)
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

    public async Task<PaginatedResult<ReviewDto>> GetPendingReviewsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var query = _context.Reviews
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

        var reviewDtos = _mapper.Map<List<ReviewDto>>(reviews);

        return new PaginatedResult<ReviewDto>
        {
            Items = reviewDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<ReviewDto?> GetReviewByIdAsync(int reviewId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var review = await _context.Reviews
            .Include(r => r.Restaurant)
            .Include(r => r.Customer)
            .Where(r => r.Id == reviewId.ToString() && !r.IsDeleted)
            .FirstOrDefaultAsync();

        if (review == null)
            return null;
        
        var isOwner = await IsRestaurantOwnerAsync(review.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this review.");

        return _mapper.Map<ReviewDto>(review);
    }

    public async Task ApproveReviewAsync(int reviewId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var review = await _context.Reviews
            .Include(r => r.Restaurant)
            .FirstOrDefaultAsync(r => r.Id == reviewId.ToString() && !r.IsDeleted);

        if (review == null)
            throw new Exception("Review not found.");
        
        var isOwner = await IsRestaurantOwnerAsync(review.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this review.");

        review.Status = "Approved";
        review.UpdatedAt = DateTime.UtcNow;
        review.UpdatedBy = ownerId;

        await _context.SaveChangesAsync();
    }

    public async Task RejectReviewAsync(int reviewId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var review = await _context.Reviews
            .Include(r => r.Restaurant)
            .FirstOrDefaultAsync(r => r.Id == reviewId.ToString() && !r.IsDeleted);

        if (review == null)
            throw new Exception("Review not found.");
        
        var isOwner = await IsRestaurantOwnerAsync(review.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this review.");

        review.Status = "Rejected";
        review.UpdatedAt = DateTime.UtcNow;
        review.UpdatedBy = ownerId;

        await _context.SaveChangesAsync();
    }

    public async Task RespondToReviewAsync(int reviewId, string response, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        if (string.IsNullOrEmpty(response))
            throw new ArgumentException("Response cannot be null or empty.", nameof(response));

        var review = await _context.Reviews
            .Include(r => r.Restaurant)
            .FirstOrDefaultAsync(r => r.Id == reviewId.ToString() && !r.IsDeleted);

        if (review == null)
            throw new Exception("Review not found.");
        
        var isOwner = await IsRestaurantOwnerAsync(review.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this review.");

        review.OwnerResponse = response;
        review.RespondedAt = DateTime.UtcNow;
        review.UpdatedAt = DateTime.UtcNow;
        review.UpdatedBy = ownerId;

        await _context.SaveChangesAsync();
    }

    public async Task<int> GetPendingReviewsCountAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        return await _context.Reviews
            .Where(r => r.RestaurantId == restaurantId 
                && r.Status == "Pending" 
                && !r.IsDeleted)
            .CountAsync();
    }

    public async Task<double> GetAverageRatingAsync(string restaurantId)
    {
        var approvedReviews = await _context.Reviews
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

        var query = _context.Orders
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

        var orderDtos = _mapper.Map<List<OrderDto>>(orders);

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

        var query = _context.Orders
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

        var orderDtos = _mapper.Map<List<OrderDto>>(orders);

        return new PaginatedResult<OrderDto>
        {
            Items = orderDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<OrderDto?> GetOrderByIdAsync(int orderId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var order = await _context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.Customer)
            .Include(o => o.Table)
            .Include(o => o.DeliveryPerson)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Where(o => o.Id == orderId.ToString() && !o.IsDeleted)
            .FirstOrDefaultAsync();

        if (order == null)
            return null;

      
        var isOwner = await IsRestaurantOwnerAsync(order.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this order.");

        return _mapper.Map<OrderDto>(order);
    }

    public async Task<OrderDto> UpdateOrderStatusAsync(int orderId, OrderStatus newStatus, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var order = await _context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.Customer)
            .Include(o => o.Table)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .FirstOrDefaultAsync(o => o.Id == orderId.ToString() && !o.IsDeleted);

        if (order == null)
            throw new Exception("Order not found.");


        var isOwner = await IsRestaurantOwnerAsync(order.RestaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this order.");

        order.Status = newStatus;
        
        
        if (newStatus == OrderStatus.Completed || newStatus == OrderStatus.Served)
        {
            order.CompletedAt = DateTime.UtcNow;
        }

        order.UpdatedAt = DateTime.UtcNow;
        order.UpdatedBy = ownerId;

        await _context.SaveChangesAsync();

        return _mapper.Map<OrderDto>(order);
    }

    public async Task<decimal> GetTotalRevenueAsync(string restaurantId, string ownerId)
    {
        if (string.IsNullOrEmpty(ownerId))
            throw new ArgumentException("Owner ID cannot be null or empty.", nameof(ownerId));

        var isOwner = await IsRestaurantOwnerAsync(restaurantId, ownerId);
        if (!isOwner)
            throw new Exception("You don't have access to this restaurant.");

        var totalRevenue = await _context.Orders
            .Where(o => o.RestaurantId == restaurantId 
                && (o.Status == OrderStatus.Completed || o.Status == OrderStatus.Served)
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
        var todayRevenue = await _context.Orders
            .Where(o => o.RestaurantId == restaurantId 
                && o.OrderDate.Date == today
                && (o.Status == OrderStatus.Completed || o.Status == OrderStatus.Served)
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

        return await _context.Orders
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
        return await _context.Orders
            .Where(o => o.RestaurantId == restaurantId 
                && o.OrderDate.Date == today
                && !o.IsDeleted)
            .CountAsync();
    }

    public Task<PaginatedResult<ReservationDto>> GetRestaurantReservationsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        throw new NotImplementedException();
    }

    public Task<PaginatedResult<ReservationDto>> GetReservationsByStatusAsync(string restaurantId, ReservationStatus status, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        throw new NotImplementedException();
    }

    public Task<ReservationDto?> GetReservationByIdAsync(int reservationId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<ReservationDto> UpdateReservationStatusAsync(int reservationId, ReservationStatus newStatus, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<int> GetActiveReservationsCountAsync(string restaurantId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<ReservationDto>> GetTodayReservationsAsync(string restaurantId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<MenuDto>> GetRestaurantMenusAsync(string restaurantId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<MenuDto?> GetMenuByIdAsync(int menuId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<MenuDto> CreateMenuAsync(string restaurantId, CreateMenuDto dto, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<MenuDto> UpdateMenuAsync(int menuId, UpdateMenuDto dto, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task DeleteMenuAsync(int menuId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<PaginatedResult<MenuItemDto>> GetMenuItemsAsync(int menuId, string ownerId, int pageNumber = 1, int pageSize = 20)
    {
        throw new NotImplementedException();
    }

    public Task<MenuItemDto?> GetMenuItemByIdAsync(int menuItemId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<MenuItemDto> CreateMenuItemAsync(int menuId, CreateMenuItemDto dto, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<MenuItemDto> UpdateMenuItemAsync(int menuItemId, UpdateMenuItemDto dto, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task DeleteMenuItemAsync(int menuItemId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task UpdateMenuItemAvailabilityAsync(int menuItemId, bool isAvailable, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<int> GetMenuItemsCountAsync(string restaurantId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<TableDto>> GetRestaurantTablesAsync(string restaurantId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<TableDto?> GetTableByIdAsync(int tableId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<TableDto> CreateTableAsync(string restaurantId, CreateTableDto dto, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<TableDto> UpdateTableAsync(int tableId, UpdateTableDto dto, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task DeleteTableAsync(int tableId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<TableDto> UpdateTableStatusAsync(int tableId, TableStatus newStatus, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<int> GetAvailableTablesCountAsync(string restaurantId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<SalesReportDto> GetSalesReportAsync(string restaurantId, DateTime startDate, DateTime endDate, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<OrderDto>> GetOrdersByDateRangeAsync(string restaurantId, DateTime startDate, DateTime endDate, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<CategorySalesDto>> GetCategorySalesAsync(string restaurantId, DateTime startDate, DateTime endDate, string ownerId)
    {
        throw new NotImplementedException();
    }
}
