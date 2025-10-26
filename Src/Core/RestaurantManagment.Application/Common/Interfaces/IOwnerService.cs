using RestaurantManagment.Application.Common.DTOs.Common;
using RestaurantManagment.Application.Common.DTOs.Owner;
using RestaurantManagment.Application.Common.DTOs.Employee;
using RestaurantManagment.Application.Common.DTOs.JobApplication;
using RestaurantManagment.Application.Common.DTOs.Review;
using RestaurantManagment.Application.Common.DTOs.Order;
using RestaurantManagment.Application.Common.DTOs.Reservation;
using RestaurantManagment.Application.Common.DTOs.Menu;
using MenuItemDto = RestaurantManagment.Application.Common.DTOs.MenuItem.MenuItemDto;
using CreateMenuItemDto = RestaurantManagment.Application.Common.DTOs.MenuItem.CreateMenuItemDto;
using UpdateMenuItemDto = RestaurantManagment.Application.Common.DTOs.MenuItem.UpdateMenuItemDto;
using RestaurantManagment.Application.Common.DTOs.Restaurant;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Application.Common.Interfaces;

public interface IOwnerService
{
   
    Task<IEnumerable<Restaurant>> GetOwnerRestaurantsAsync(string ownerId);
    Task<Restaurant?> GetRestaurantByIdAsync(string restaurantId, string ownerId);
    Task<Restaurant> CreateRestaurantAsync(CreateRestaurantDto dto, string ownerId);
    Task<Restaurant> UpdateRestaurantAsync(int restaurantId, UpdateRestaurantDto dto, string ownerId);
    Task DeleteRestaurantAsync(int restaurantId, string ownerId);
    Task<bool> IsRestaurantOwnerAsync(int restaurantId, string ownerId);
    
   
    Task<OwnerDashboardDto> GetDashboardDataAsync(int restaurantId, string ownerId);
    Task<OwnerStatisticsDto> GetStatisticsAsync(int restaurantId, string ownerId);
    Task<IEnumerable<TopSellingItemDto>> GetTopSellingItemsAsync(int restaurantId, int count = 10);
    Task<RevenueChartDto> GetRevenueChartDataAsync(int restaurantId, int days = 30);
    
    
    Task<PaginatedResult<EmployeeDto>> GetEmployeesAsync(int restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<EmployeeDto?> GetEmployeeByIdAsync(int restaurantId, string employeeId, string ownerId);
    Task<EmployeeDto> CreateEmployeeAsync(int restaurantId, CreateEmployeeDto dto, string ownerId);
    Task<EmployeeDto> UpdateEmployeeAsync(int restaurantId, string employeeId, UpdateEmployeeDto dto, string ownerId);
    Task DeleteEmployeeAsync(int restaurantId, string employeeId, string ownerId);
    Task<int> GetEmployeeCountAsync(int restaurantId, string ownerId);
    

    Task<PaginatedResult<JobApplicationDto>> GetJobApplicationsAsync(int restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<PaginatedResult<JobApplicationDto>> GetPendingJobApplicationsAsync(int restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<JobApplicationDto?> GetJobApplicationByIdAsync(int applicationId, string ownerId);
    Task AcceptJobApplicationAsync(int applicationId, string ownerId);
    Task RejectJobApplicationAsync(int applicationId, string ownerId, string? rejectionReason = null);
    Task<int> GetPendingApplicationsCountAsync(int restaurantId, string ownerId);
    
   
    Task<PaginatedResult<ReviewDto>> GetRestaurantReviewsAsync(int restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<PaginatedResult<ReviewDto>> GetPendingReviewsAsync(int restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<ReviewDto?> GetReviewByIdAsync(int reviewId, string ownerId);
    Task ApproveReviewAsync(int reviewId, string ownerId);
    Task RejectReviewAsync(int reviewId, string ownerId);
    Task RespondToReviewAsync(int reviewId, string response, string ownerId);
    Task<int> GetPendingReviewsCountAsync(int restaurantId, string ownerId);
    Task<double> GetAverageRatingAsync(int restaurantId);
    
    
    Task<PaginatedResult<OrderDto>> GetRestaurantOrdersAsync(int restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<PaginatedResult<OrderDto>> GetOrdersByStatusAsync(int restaurantId, OrderStatus status, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<OrderDto?> GetOrderByIdAsync(int orderId, string ownerId);
    Task<OrderDto> UpdateOrderStatusAsync(int orderId, OrderStatus newStatus, string ownerId);
    Task<decimal> GetTotalRevenueAsync(int restaurantId, string ownerId);
    Task<decimal> GetTodayRevenueAsync(int restaurantId, string ownerId);
    Task<int> GetTotalOrdersCountAsync(int restaurantId, string ownerId);
    Task<int> GetTodayOrdersCountAsync(int restaurantId, string ownerId);
    
   
    Task<PaginatedResult<ReservationDto>> GetRestaurantReservationsAsync(int restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<PaginatedResult<ReservationDto>> GetReservationsByStatusAsync(int restaurantId, ReservationStatus status, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<ReservationDto?> GetReservationByIdAsync(int reservationId, string ownerId);
    Task<ReservationDto> UpdateReservationStatusAsync(int reservationId, ReservationStatus newStatus, string ownerId);
    Task<int> GetActiveReservationsCountAsync(int restaurantId, string ownerId);
    Task<IEnumerable<ReservationDto>> GetTodayReservationsAsync(int restaurantId, string ownerId);
    
   
    Task<IEnumerable<MenuDto>> GetRestaurantMenusAsync(int restaurantId, string ownerId);
    Task<MenuDto?> GetMenuByIdAsync(int menuId, string ownerId);
    Task<MenuDto> CreateMenuAsync(int restaurantId, CreateMenuDto dto, string ownerId);
    Task<MenuDto> UpdateMenuAsync(int menuId, UpdateMenuDto dto, string ownerId);
    Task DeleteMenuAsync(int menuId, string ownerId);
    
 
    Task<PaginatedResult<MenuItemDto>> GetMenuItemsAsync(int menuId, string ownerId, int pageNumber = 1, int pageSize = 20);
    Task<MenuItemDto?> GetMenuItemByIdAsync(int menuItemId, string ownerId);
    Task<MenuItemDto> CreateMenuItemAsync(int menuId, CreateMenuItemDto dto, string ownerId);
    Task<MenuItemDto> UpdateMenuItemAsync(int menuItemId, UpdateMenuItemDto dto, string ownerId);
    Task DeleteMenuItemAsync(int menuItemId, string ownerId);
    Task UpdateMenuItemAvailabilityAsync(int menuItemId, bool isAvailable, string ownerId);
    Task<int> GetMenuItemsCountAsync(int restaurantId, string ownerId);
    
   
    Task<IEnumerable<TableDto>> GetRestaurantTablesAsync(int restaurantId, string ownerId);
    Task<TableDto?> GetTableByIdAsync(int tableId, string ownerId);
    Task<TableDto> CreateTableAsync(int restaurantId, CreateTableDto dto, string ownerId);
    Task<TableDto> UpdateTableAsync(int tableId, UpdateTableDto dto, string ownerId);
    Task DeleteTableAsync(int tableId, string ownerId);
    Task<TableDto> UpdateTableStatusAsync(int tableId, TableStatus newStatus, string ownerId);
    Task<int> GetAvailableTablesCountAsync(int restaurantId, string ownerId);
    
 
    Task<SalesReportDto> GetSalesReportAsync(int restaurantId, DateTime startDate, DateTime endDate, string ownerId);
    Task<IEnumerable<OrderDto>> GetOrdersByDateRangeAsync(int restaurantId, DateTime startDate, DateTime endDate, string ownerId);
    Task<IEnumerable<CategorySalesDto>> GetCategorySalesAsync(int restaurantId, DateTime startDate, DateTime endDate, string ownerId);
}
