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
            throw new Exception("Restoran bulunamadı veya bu restorana erişim yetkiniz yok.");

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
            throw new Exception("Restoran bulunamadı veya bu restorana erişim yetkiniz yok.");

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
            throw new Exception("Restoran bulunamadı.");

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
            throw new Exception("Bu restorana erişim yetkiniz yok.");

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

    public Task<PaginatedResult<EmployeeDto>> GetEmployeesAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        throw new NotImplementedException();
    }

    public Task<EmployeeDto?> GetEmployeeByIdAsync(string restaurantId, string employeeId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<EmployeeDto> CreateEmployeeAsync(string restaurantId, CreateEmployeeDto dto, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<EmployeeDto> UpdateEmployeeAsync(string restaurantId, string employeeId, UpdateEmployeeDto dto, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task DeleteEmployeeAsync(string restaurantId, string employeeId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<int> GetEmployeeCountAsync(string restaurantId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<PaginatedResult<JobApplicationDto>> GetJobApplicationsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        throw new NotImplementedException();
    }

    public Task<PaginatedResult<JobApplicationDto>> GetPendingJobApplicationsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        throw new NotImplementedException();
    }

    public Task<JobApplicationDto?> GetJobApplicationByIdAsync(int applicationId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task AcceptJobApplicationAsync(int applicationId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task RejectJobApplicationAsync(int applicationId, string ownerId, string? rejectionReason = null)
    {
        throw new NotImplementedException();
    }

    public Task<int> GetPendingApplicationsCountAsync(string restaurantId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<PaginatedResult<ReviewDto>> GetRestaurantReviewsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        throw new NotImplementedException();
    }

    public Task<PaginatedResult<ReviewDto>> GetPendingReviewsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        throw new NotImplementedException();
    }

    public Task<ReviewDto?> GetReviewByIdAsync(int reviewId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task ApproveReviewAsync(int reviewId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task RejectReviewAsync(int reviewId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task RespondToReviewAsync(int reviewId, string response, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<int> GetPendingReviewsCountAsync(string restaurantId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<double> GetAverageRatingAsync(string restaurantId)
    {
        throw new NotImplementedException();
    }

    public Task<PaginatedResult<OrderDto>> GetRestaurantOrdersAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        throw new NotImplementedException();
    }

    public Task<PaginatedResult<OrderDto>> GetOrdersByStatusAsync(string restaurantId, OrderStatus status, string ownerId, int pageNumber = 1, int pageSize = 10)
    {
        throw new NotImplementedException();
    }

    public Task<OrderDto?> GetOrderByIdAsync(int orderId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<OrderDto> UpdateOrderStatusAsync(int orderId, OrderStatus newStatus, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<decimal> GetTotalRevenueAsync(string restaurantId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<decimal> GetTodayRevenueAsync(string restaurantId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<int> GetTotalOrdersCountAsync(string restaurantId, string ownerId)
    {
        throw new NotImplementedException();
    }

    public Task<int> GetTodayOrdersCountAsync(string restaurantId, string ownerId)
    {
        throw new NotImplementedException();
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