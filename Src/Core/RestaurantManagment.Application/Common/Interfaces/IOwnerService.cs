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
using RestaurantManagment.Application.Common.DTOs.Reward;
using RestaurantManagment.Domain.Models;
using CreateMenuDto = RestaurantManagment.Application.Common.DTOs.Menu.CreateMenuDto;
using UpdateMenuDto = RestaurantManagment.Application.Common.DTOs.Menu.UpdateMenuDto;

namespace RestaurantManagment.Application.Common.Interfaces;

public interface IOwnerService
{

    Task<IEnumerable<OwnerRestaurantDto>> GetOwnerRestaurantsAsync(string ownerId);
    Task<Restaurant?> GetRestaurantByIdAsync(string restaurantId, string ownerId);
    Task<Restaurant> CreateRestaurantAsync(CreateRestaurantDto dto, string ownerId);
    Task<Restaurant> UpdateRestaurantAsync(string restaurantId, UpdateRestaurantDto dto, string ownerId);
    Task DeleteRestaurantAsync(string restaurantId, string ownerId);
    Task<bool> IsRestaurantOwnerAsync(string restaurantId, string ownerId);
    
   
    Task<OwnerDashboardDto> GetDashboardDataAsync(string restaurantId, string ownerId);
    Task<OwnerStatisticsDto> GetStatisticsAsync(string restaurantId, string ownerId);
    Task<IEnumerable<TopSellingItemDto>> GetTopSellingItemsAsync(string restaurantId, int count = 10);
    Task<RevenueChartDto> GetRevenueChartDataAsync(string restaurantId, int days = 30);
    
    
    Task<PaginatedResult<EmployeeDto>> GetEmployeesAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<EmployeeDto?> GetEmployeeByIdAsync(string restaurantId, string employeeId, string ownerId);
    Task<EmployeeDto> CreateEmployeeAsync(string restaurantId, CreateEmployeeDto dto, string ownerId);
    Task<EmployeeDto> UpdateEmployeeAsync(string restaurantId, string employeeId, UpdateEmployeeDto dto, string ownerId);
    Task DeleteEmployeeAsync(string restaurantId, string employeeId, string ownerId);
    Task<int> GetEmployeeCountAsync(string restaurantId, string ownerId);
    

    Task<PaginatedResult<JobApplicationDto>> GetJobApplicationsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<PaginatedResult<JobApplicationDto>> GetPendingJobApplicationsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<JobApplicationDto?> GetJobApplicationByIdAsync(string applicationId, string ownerId);
    Task AcceptJobApplicationAsync(string applicationId, string ownerId);
    Task RejectJobApplicationAsync(string applicationId, string ownerId, string? rejectionReason = null);
    Task<int> GetPendingApplicationsCountAsync(string restaurantId, string ownerId);
    
   
    Task<PaginatedResult<ReviewDto>> GetRestaurantReviewsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<PaginatedResult<ReviewDto>> GetPendingReviewsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<ReviewDto?> GetReviewByIdAsync(string reviewId, string ownerId);
    Task ApproveReviewAsync(string reviewId, string ownerId);
    Task RejectReviewAsync(string reviewId, string ownerId);
    Task RespondToReviewAsync(string reviewId, string response, string ownerId);
    Task<int> GetPendingReviewsCountAsync(string restaurantId, string ownerId);
    Task<double> GetAverageRatingAsync(string restaurantId);
    
    
    Task<PaginatedResult<OrderDto>> GetRestaurantOrdersAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<PaginatedResult<OrderDto>> GetOrdersByStatusAsync(string restaurantId, OrderStatus status, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<OrderDto?> GetOrderByIdAsync(string orderId, string ownerId);
    Task<OrderDto> UpdateOrderStatusAsync(string orderId, OrderStatus newStatus, string ownerId);
    Task<decimal> GetTotalRevenueAsync(string restaurantId, string ownerId);
    Task<decimal> GetTodayRevenueAsync(string restaurantId, string ownerId);
    Task<int> GetTotalOrdersCountAsync(string restaurantId, string ownerId);
    Task<int> GetTodayOrdersCountAsync(string restaurantId, string ownerId);
    
   
    Task<PaginatedResult<ReservationDto>> GetRestaurantReservationsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<PaginatedResult<ReservationDto>> GetReservationsByStatusAsync(string restaurantId, ReservationStatus status, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<ReservationDto?> GetReservationByIdAsync(string reservationId, string ownerId);
    Task<ReservationDto> UpdateReservationStatusAsync(string reservationId, ReservationStatus newStatus, string ownerId);
    Task<int> GetActiveReservationsCountAsync(string restaurantId, string ownerId);
    Task<IEnumerable<ReservationDto>> GetTodayReservationsAsync(string restaurantId, string ownerId);
    
   
    Task<IEnumerable<MenuDto>> GetRestaurantMenusAsync(string restaurantId, string ownerId);
    Task<MenuDto?> GetMenuByIdAsync(string menuId, string ownerId);
    Task<MenuDto> CreateMenuAsync(string restaurantId, CreateMenuDto dto, string ownerId);
    Task<MenuDto> UpdateMenuAsync(string menuId, UpdateMenuDto dto, string ownerId);
    Task DeleteMenuAsync(string menuId, string ownerId);
    
 
    Task<PaginatedResult<MenuItemDto>> GetMenuItemsAsync(string menuId, string ownerId, int pageNumber = 1, int pageSize = 20);
    Task<MenuItemDto?> GetMenuItemByIdAsync(string menuItemId, string ownerId);
    Task<MenuItemDto> CreateMenuItemAsync(string menuId, CreateMenuItemDto dto, string ownerId);
    Task<MenuItemDto> UpdateMenuItemAsync(string menuItemId, UpdateMenuItemDto dto, string ownerId);
    Task DeleteMenuItemAsync(string menuItemId, string ownerId);
    Task UpdateMenuItemAvailabilityAsync(string menuItemId, bool isAvailable, string ownerId);
    Task<int> GetMenuItemsCountAsync(string restaurantId, string ownerId);
    
   
    Task<IEnumerable<TableDto>> GetRestaurantTablesAsync(string restaurantId, string ownerId);
    Task<TableDto?> GetTableByIdAsync(string tableId, string ownerId);
    Task<TableDto> CreateTableAsync(string restaurantId, CreateTableDto dto, string ownerId);
    Task<TableDto> UpdateTableAsync(string tableId, UpdateTableDto dto, string ownerId);
    Task DeleteTableAsync(string tableId, string ownerId);
    Task<TableDto> UpdateTableStatusAsync(string tableId, TableStatus newStatus, string ownerId);
    Task<int> GetAvailableTablesCountAsync(string restaurantId, string ownerId);
    
 
    Task<SalesReportDto> GetSalesReportAsync(string restaurantId, DateTime startDate, DateTime endDate, string ownerId);
    Task<IEnumerable<OrderDto>> GetOrdersByDateRangeAsync(string restaurantId, DateTime startDate, DateTime endDate, string ownerId);
    Task<IEnumerable<CategorySalesDto>> GetCategorySalesAsync(string restaurantId, DateTime startDate, DateTime endDate, string ownerId);
    
    Task<PaginatedResult<RewardDto>> GetRestaurantRewardsAsync(string restaurantId, string ownerId, int pageNumber = 1, int pageSize = 10);
    Task<RewardDto?> GetRewardByIdAsync(string rewardId, string ownerId);
    Task<RewardDto> CreateRewardAsync(string restaurantId, CreateRewardDto dto, string ownerId);
    Task<RewardDto> UpdateRewardAsync(string rewardId, UpdateRewardDto dto, string ownerId);
    Task DeleteRewardAsync(string rewardId, string ownerId);
    Task ToggleRewardActiveStatusAsync(string rewardId, string ownerId);
}
