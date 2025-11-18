using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RestaurantManagment.Application.Common.DTOs.Customer;
using RestaurantManagment.Application.Common.Interfaces;
using RestaurantManagment.Domain.Models;
using RestaurantManagment.Domain.Enums;

namespace RestaurantManagment.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Customer")]
public class CustomerController : ControllerBase
{
    private readonly ICustomerService _customerService;
    private readonly UserManager<AppUser> _userManager;

    public CustomerController(ICustomerService customerService, UserManager<AppUser> userManager)
    {
        _customerService = customerService;
        _userManager = userManager;
    }

    #region Restaurant Endpoints

    [HttpGet("restaurants")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRestaurants([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _customerService.GetRestaurantsAsync(pageNumber, pageSize);
        return Ok(result);
    }

    [HttpGet("restaurants/{restaurantId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRestaurantById(string restaurantId)
    {
        var restaurant = await _customerService.GetRestaurantByIdAsync(restaurantId);
        if (restaurant == null)
            return NotFound(new { Message = "Restaurant not found" });

        return Ok(restaurant);
    }

    [HttpGet("restaurants/search")]
    [AllowAnonymous]
    public async Task<IActionResult> SearchRestaurants([FromQuery] string searchTerm)
    {
        var restaurants = await _customerService.SearchRestaurantsAsync(searchTerm);
        return Ok(restaurants);
    }

    [HttpGet("restaurants/category/{category}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRestaurantsByCategory(RestaurantCategory category)
    {
        var restaurants = await _customerService.GetRestaurantsByCategoryAsync(category);
        return Ok(restaurants);
    }

    [HttpGet("restaurants/nearby")]
    [AllowAnonymous]
    public async Task<IActionResult> GetNearbyRestaurants([FromQuery] double latitude, [FromQuery] double longitude, [FromQuery] double radiusKm = 5)
    {
        var restaurants = await _customerService.GetNearbyRestaurantsAsync(latitude, longitude, radiusKm);
        return Ok(restaurants);
    }

    [HttpGet("restaurants/top-rated")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTopRatedRestaurants([FromQuery] int count = 10)
    {
        var restaurants = await _customerService.GetTopRatedRestaurantsAsync(count);
        return Ok(restaurants);
    }

    #endregion

    #region Menu Endpoints

    [HttpGet("restaurants/{restaurantId}/menus")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRestaurantMenus(string restaurantId)
    {
        var menus = await _customerService.GetRestaurantMenusAsync(restaurantId);
        return Ok(menus);
    }

    [HttpGet("menus/{menuId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetMenuById(string menuId)
    {
        var menu = await _customerService.GetMenuByIdAsync(menuId);
        if (menu == null)
            return NotFound(new { Message = "Menu not found" });

        return Ok(menu);
    }

    [HttpGet("menus/{menuId}/items")]
    [AllowAnonymous]
    public async Task<IActionResult> GetMenuItems(string menuId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _customerService.GetMenuItemsAsync(menuId, pageNumber, pageSize);
        return Ok(result);
    }

    [HttpGet("menu-items/{menuItemId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetMenuItemById(string menuItemId)
    {
        var menuItem = await _customerService.GetMenuItemByIdAsync(menuItemId);
        if (menuItem == null)
            return NotFound(new { Message = "Menu item not found" });

        return Ok(menuItem);
    }

    [HttpGet("restaurants/{restaurantId}/available-items")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAvailableMenuItems(string restaurantId)
    {
        var items = await _customerService.GetAvailableMenuItemsAsync(restaurantId);
        return Ok(items);
    }

    [HttpGet("restaurants/{restaurantId}/menu-items/search")]
    [AllowAnonymous]
    public async Task<IActionResult> SearchMenuItems(string restaurantId, [FromQuery] string searchTerm)
    {
        var items = await _customerService.SearchMenuItemsAsync(restaurantId, searchTerm);
        return Ok(items);
    }

    #endregion

    #region Order Endpoints

    [HttpGet("orders")]
    public async Task<IActionResult> GetMyOrders([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var result = await _customerService.GetMyOrdersAsync(currentUser.Id, pageNumber, pageSize);
        return Ok(result);
    }

    [HttpGet("orders/{orderId}")]
    public async Task<IActionResult> GetOrderById(string orderId)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var order = await _customerService.GetOrderByIdAsync(orderId, currentUser.Id);
        if (order == null)
            return NotFound(new { Message = "Order not found" });

        return Ok(order);
    }

    [HttpPost("orders")]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var order = await _customerService.CreateOrderAsync(dto, currentUser.Id);
            return Ok(order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { ex.Message });
        }
    }

    [HttpPut("orders/{orderId}")]
    public async Task<IActionResult> UpdateOrder(string orderId, [FromBody] UpdateOrderDto dto)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var order = await _customerService.UpdateOrderAsync(orderId, dto, currentUser.Id);
            return Ok(order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { ex.Message });
        }
    }

    [HttpPost("orders/{orderId}/cancel")]
    public async Task<IActionResult> CancelOrder(string orderId)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            await _customerService.CancelOrderAsync(orderId, currentUser.Id);
            return Ok(new { Message = "Order cancelled successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { ex.Message });
        }
    }

    [HttpGet("orders/active")]
    public async Task<IActionResult> GetActiveOrders()
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var orders = await _customerService.GetActiveOrdersAsync(currentUser.Id);
        return Ok(orders);
    }

    [HttpGet("orders/history")]
    public async Task<IActionResult> GetOrderHistory()
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var orders = await _customerService.GetOrderHistoryAsync(currentUser.Id);
        return Ok(orders);
    }

    [HttpGet("orders/current")]
    public async Task<IActionResult> GetCurrentOrder()
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var order = await _customerService.GetCurrentOrderAsync(currentUser.Id);
        return Ok(order);
    }

    [HttpGet("orders/count")]
    public async Task<IActionResult> GetOrdersCount()
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var count = await _customerService.GetOrdersCountAsync(currentUser.Id);
        return Ok(new { Count = count });
    }

    #endregion

    #region Reservation Endpoints

    [HttpGet("reservations")]
    public async Task<IActionResult> GetMyReservations([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var result = await _customerService.GetMyReservationsAsync(currentUser.Id, pageNumber, pageSize);
        return Ok(result);
    }

    [HttpGet("reservations/{reservationId}")]
    public async Task<IActionResult> GetReservationById(string reservationId)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var reservation = await _customerService.GetReservationByIdAsync(reservationId, currentUser.Id);
        if (reservation == null)
            return NotFound(new { Message = "Reservation not found" });

        return Ok(reservation);
    }

    [HttpPost("reservations")]
    public async Task<IActionResult> CreateReservation([FromBody] CreateReservationDto dto)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var reservation = await _customerService.CreateReservationAsync(dto, currentUser.Id);
            return Ok(reservation);
        }
        catch (Exception ex)
        {
            return BadRequest(new { ex.Message });
        }
    }

    [HttpPut("reservations/{reservationId}")]
    public async Task<IActionResult> UpdateReservation(string reservationId, [FromBody] UpdateReservationDto dto)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var reservation = await _customerService.UpdateReservationAsync(reservationId, dto, currentUser.Id);
            return Ok(reservation);
        }
        catch (Exception ex)
        {
            return BadRequest(new { ex.Message });
        }
    }

    [HttpPost("reservations/{reservationId}/cancel")]
    public async Task<IActionResult> CancelReservation(string reservationId)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            await _customerService.CancelReservationAsync(reservationId, currentUser.Id);
            return Ok(new { Message = "Reservation cancelled successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { ex.Message });
        }
    }

    [HttpGet("reservations/upcoming")]
    public async Task<IActionResult> GetUpcomingReservations()
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var reservations = await _customerService.GetUpcomingReservationsAsync(currentUser.Id);
        return Ok(reservations);
    }

    [HttpGet("reservations/past")]
    public async Task<IActionResult> GetPastReservations()
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var reservations = await _customerService.GetPastReservationsAsync(currentUser.Id);
        return Ok(reservations);
    }

    [HttpGet("restaurants/{restaurantId}/available-tables")]
    public async Task<IActionResult> GetAvailableTables(string restaurantId, [FromQuery] DateTime date, [FromQuery] int partySize)
    {
        var tables = await _customerService.GetAvailableTablesAsync(restaurantId, date, partySize);
        return Ok(tables);
    }

    [HttpGet("tables/{tableId}/availability")]
    public async Task<IActionResult> CheckTableAvailability(string tableId, [FromQuery] DateTime date)
    {
        var isAvailable = await _customerService.CheckTableAvailabilityAsync(tableId, date);
        return Ok(new { IsAvailable = isAvailable });
    }

    #endregion

    #region Review Endpoints

    [HttpGet("restaurants/{restaurantId}/reviews")]
    public async Task<IActionResult> GetRestaurantReviews(string restaurantId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _customerService.GetRestaurantReviewsAsync(restaurantId, pageNumber, pageSize);
        return Ok(result);
    }

    [HttpGet("reviews")]
    public async Task<IActionResult> GetMyReviews([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var result = await _customerService.GetMyReviewsAsync(currentUser.Id, pageNumber, pageSize);
        return Ok(result);
    }

    [HttpGet("reviews/{reviewId}")]
    public async Task<IActionResult> GetReviewById(string reviewId)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var review = await _customerService.GetReviewByIdAsync(reviewId, currentUser.Id);
        if (review == null)
            return NotFound(new { Message = "Review not found" });

        return Ok(review);
    }

    [HttpPost("reviews")]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var review = await _customerService.CreateReviewAsync(dto, currentUser.Id);
            return Ok(review);
        }
        catch (Exception ex)
        {
            return BadRequest(new { ex.Message });
        }
    }

    [HttpPut("reviews/{reviewId}")]
    public async Task<IActionResult> UpdateReview(string reviewId, [FromBody] UpdateReviewDto dto)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var review = await _customerService.UpdateReviewAsync(reviewId, dto, currentUser.Id);
            return Ok(review);
        }
        catch (Exception ex)
        {
            return BadRequest(new { ex.Message });
        }
    }

    [HttpDelete("reviews/{reviewId}")]
    public async Task<IActionResult> DeleteReview(string reviewId)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            await _customerService.DeleteReviewAsync(reviewId, currentUser.Id);
            return Ok(new { Message = "Review deleted successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/can-review")]
    public async Task<IActionResult> CanReviewRestaurant(string restaurantId)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var canReview = await _customerService.CanReviewRestaurantAsync(restaurantId, currentUser.Id);
        return Ok(new { CanReview = canReview });
    }

    [HttpGet("restaurants/{restaurantId}/my-review")]
    public async Task<IActionResult> GetMyReviewForRestaurant(string restaurantId)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var review = await _customerService.GetMyReviewForRestaurantAsync(restaurantId, currentUser.Id);
        return Ok(review);
    }

    [HttpGet("restaurants/{restaurantId}/average-rating")]
    public async Task<IActionResult> GetRestaurantAverageRating(string restaurantId)
    {
        var averageRating = await _customerService.GetRestaurantAverageRatingAsync(restaurantId);
        return Ok(new { AverageRating = averageRating });
    }

    #endregion

    #region Favorites Endpoints

    [HttpGet("favorites")]
    public async Task<IActionResult> GetFavoriteRestaurants()
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var restaurants = await _customerService.GetFavoriteRestaurantsAsync(currentUser.Id);
        return Ok(restaurants);
    }

    [HttpPost("favorites/{restaurantId}")]
    public async Task<IActionResult> AddToFavorites(string restaurantId)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            await _customerService.AddToFavoritesAsync(restaurantId, currentUser.Id);
            return Ok(new { Message = "Restaurant added to favorites" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { ex.Message });
        }
    }

    [HttpDelete("favorites/{restaurantId}")]
    public async Task<IActionResult> RemoveFromFavorites(string restaurantId)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            await _customerService.RemoveFromFavoritesAsync(restaurantId, currentUser.Id);
            return Ok(new { Message = "Restaurant removed from favorites" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { ex.Message });
        }
    }

    [HttpGet("favorites/{restaurantId}/check")]
    public async Task<IActionResult> IsFavoriteRestaurant(string restaurantId)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var isFavorite = await _customerService.IsFavoriteRestaurantAsync(restaurantId, currentUser.Id);
        return Ok(new { IsFavorite = isFavorite });
    }

    #endregion

    #region Statistics & Recommendations Endpoints

    [HttpGet("statistics")]
    public async Task<IActionResult> GetCustomerStatistics()
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var statistics = await _customerService.GetCustomerStatisticsAsync(currentUser.Id);
        return Ok(statistics);
    }

    [HttpGet("recommendations")]
    public async Task<IActionResult> GetRecommendedRestaurants([FromQuery] int count = 10)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var restaurants = await _customerService.GetRecommendedRestaurantsAsync(currentUser.Id, count);
        return Ok(restaurants);
    }

    [HttpGet("total-spent")]
    public async Task<IActionResult> GetTotalSpent()
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var totalSpent = await _customerService.GetTotalSpentAsync(currentUser.Id);
        return Ok(new { TotalSpent = totalSpent });
    }

    [HttpGet("total-orders")]
    public async Task<IActionResult> GetTotalOrdersCount()
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var count = await _customerService.GetTotalOrdersCountAsync(currentUser.Id);
        return Ok(new { TotalOrders = count });
    }

    [HttpGet("total-reservations")]
    public async Task<IActionResult> GetTotalReservationsCount()
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var count = await _customerService.GetTotalReservationsCountAsync(currentUser.Id);
        return Ok(new { TotalReservations = count });
    }

    #endregion

    #region Loyalty & Rewards Endpoints

    [HttpGet("loyalty/{restaurantId}/points")]
    public async Task<IActionResult> GetLoyaltyPoints(string restaurantId)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var points = await _customerService.GetLoyaltyPointsAsync(currentUser.Id, restaurantId);
        return Ok(new { Points = points });
    }

    [HttpGet("loyalty/{restaurantId}/rewards")]
    public async Task<IActionResult> GetAvailableRewards(string restaurantId)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var rewards = await _customerService.GetAvailableRewardsAsync(currentUser.Id, restaurantId);
        return Ok(rewards);
    }

    [HttpPost("loyalty/rewards/{rewardId}/redeem")]
    public async Task<IActionResult> RedeemReward(string rewardId)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            await _customerService.RedeemRewardAsync(rewardId, currentUser.Id);
            return Ok(new { Message = "Reward redeemed successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { ex.Message });
        }
    }

    #endregion
}
