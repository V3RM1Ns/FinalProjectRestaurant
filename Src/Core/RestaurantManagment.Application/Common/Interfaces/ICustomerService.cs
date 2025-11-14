using RestaurantManagment.Application.Common.DTOs.Common;
using RestaurantManagment.Application.Common.DTOs.Order;
using RestaurantManagment.Application.Common.DTOs.Reservation;
using RestaurantManagment.Application.Common.DTOs.Review;
using RestaurantManagment.Application.Common.DTOs.Restaurant;
using RestaurantManagment.Application.Common.DTOs.Menu;
using RestaurantManagment.Application.Common.DTOs.MenuItem;
using RestaurantManagment.Application.Common.DTOs.Owner;
using CustomerDtos = RestaurantManagment.Application.Common.DTOs.Customer;

namespace RestaurantManagment.Application.Common.Interfaces;

public interface ICustomerService
{
    Task<PaginatedResult<RestaurantDto>> GetRestaurantsAsync(int pageNumber = 1, int pageSize = 10);
    Task<RestaurantDto?> GetRestaurantByIdAsync(string restaurantId);
    Task<IEnumerable<RestaurantDto>> SearchRestaurantsAsync(string searchTerm);
    Task<IEnumerable<RestaurantDto>> GetRestaurantsByCategoryAsync(string category);
    Task<IEnumerable<RestaurantDto>> GetNearbyRestaurantsAsync(double latitude, double longitude, double radiusKm);
    Task<IEnumerable<RestaurantDto>> GetTopRatedRestaurantsAsync(int count = 10);
    
    Task<IEnumerable<MenuDto>> GetRestaurantMenusAsync(string restaurantId);
    Task<MenuDto?> GetMenuByIdAsync(string menuId);
    Task<PaginatedResult<MenuItemDto>> GetMenuItemsAsync(string menuId, int pageNumber = 1, int pageSize = 20);
    Task<MenuItemDto?> GetMenuItemByIdAsync(string menuItemId);
    Task<IEnumerable<MenuItemDto>> GetAvailableMenuItemsAsync(string restaurantId);
    Task<IEnumerable<MenuItemDto>> SearchMenuItemsAsync(string restaurantId, string searchTerm);
    
    Task<PaginatedResult<OrderDto>> GetMyOrdersAsync(string customerId, int pageNumber = 1, int pageSize = 10);
    Task<OrderDto?> GetOrderByIdAsync(string orderId, string customerId);
    Task<OrderDto> CreateOrderAsync(CustomerDtos.CreateOrderDto dto, string customerId);
    Task<OrderDto> UpdateOrderAsync(string orderId, CustomerDtos.UpdateOrderDto dto, string customerId);
    Task CancelOrderAsync(string orderId, string customerId);
    Task<IEnumerable<OrderDto>> GetActiveOrdersAsync(string customerId);
    Task<IEnumerable<OrderDto>> GetOrderHistoryAsync(string customerId);
    Task<OrderDto?> GetCurrentOrderAsync(string customerId);
    Task<int> GetOrdersCountAsync(string customerId);
    
    Task<PaginatedResult<ReservationDto>> GetMyReservationsAsync(string customerId, int pageNumber = 1, int pageSize = 10);
    Task<ReservationDto?> GetReservationByIdAsync(string reservationId, string customerId);
    Task<ReservationDto> CreateReservationAsync(CustomerDtos.CreateReservationDto dto, string customerId);
    Task<ReservationDto> UpdateReservationAsync(string reservationId, CustomerDtos.UpdateReservationDto dto, string customerId);
    Task CancelReservationAsync(string reservationId, string customerId);
    Task<IEnumerable<ReservationDto>> GetUpcomingReservationsAsync(string customerId);
    Task<IEnumerable<ReservationDto>> GetPastReservationsAsync(string customerId);
    Task<IEnumerable<TableDto>> GetAvailableTablesAsync(string restaurantId, DateTime date, int partySize);
    Task<bool> CheckTableAvailabilityAsync(string tableId, DateTime date);
    
    Task<PaginatedResult<ReviewDto>> GetRestaurantReviewsAsync(string restaurantId, int pageNumber = 1, int pageSize = 10);
    Task<PaginatedResult<ReviewDto>> GetMyReviewsAsync(string customerId, int pageNumber = 1, int pageSize = 10);
    Task<ReviewDto?> GetReviewByIdAsync(string reviewId, string customerId);
    Task<ReviewDto> CreateReviewAsync(CustomerDtos.CreateReviewDto dto, string customerId);
    Task<ReviewDto> UpdateReviewAsync(string reviewId, CustomerDtos.UpdateReviewDto dto, string customerId);
    Task DeleteReviewAsync(string reviewId, string customerId);
    Task<bool> CanReviewRestaurantAsync(string restaurantId, string customerId);
    Task<ReviewDto?> GetMyReviewForRestaurantAsync(string restaurantId, string customerId);
    Task<double> GetRestaurantAverageRatingAsync(string restaurantId);
    
    Task<IEnumerable<RestaurantDto>> GetFavoriteRestaurantsAsync(string customerId);
    Task AddToFavoritesAsync(string restaurantId, string customerId);
    Task RemoveFromFavoritesAsync(string restaurantId, string customerId);
    Task<bool> IsFavoriteRestaurantAsync(string restaurantId, string customerId);
    
    Task<CustomerDtos.CustomerStatisticsDto> GetCustomerStatisticsAsync(string customerId);
    Task<IEnumerable<RestaurantDto>> GetRecommendedRestaurantsAsync(string customerId, int count = 10);
    Task<decimal> GetTotalSpentAsync(string customerId);
    Task<int> GetTotalOrdersCountAsync(string customerId);
    Task<int> GetTotalReservationsCountAsync(string customerId);
    
    Task<int> GetLoyaltyPointsAsync(string customerId, string restaurantId);
    Task<IEnumerable<CustomerDtos.RewardDto>> GetAvailableRewardsAsync(string customerId, string restaurantId);
    Task RedeemRewardAsync(string rewardId, string customerId);
}
