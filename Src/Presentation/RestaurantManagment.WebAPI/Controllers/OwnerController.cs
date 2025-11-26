using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantManagment.Application.Common.DTOs.Employee;
using RestaurantManagment.Application.Common.DTOs.Menu;
using RestaurantManagment.Application.Common.DTOs.MenuItem;
using RestaurantManagment.Application.Common.DTOs.Owner;
using RestaurantManagment.Application.Common.DTOs.Restaurant;
using RestaurantManagment.Application.Common.DTOs.Reward;
using RestaurantManagment.Application.Common.Interfaces;
using RestaurantManagment.Domain.Models;
using RestaurantManagment.Persistance.Data;

namespace RestaurantManagment.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "RestaurantOwner,Employee")]
public class OwnerController(
    IOwnerService ownerService,
    IOrderService orderService,
    UserManager<AppUser> userManager,
    IFileService fileService,
    IAppDbContext context) : ControllerBase
{
    #region Restaurant Management

    [HttpGet("restaurants")]
    public async Task<IActionResult> GetMyRestaurants()
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var restaurants = await ownerService.GetOwnerRestaurantsAsync(currentUser.Id);
        return Ok(restaurants);
    }

    [HttpGet("restaurants/{restaurantId}")]
    public async Task<IActionResult> GetRestaurantById(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        var restaurant = await ownerService.GetRestaurantByIdAsync(restaurantId, currentUser.Id);
        if (restaurant == null)
            return NotFound(new { Message = "Restaurant not found" });

        return Ok(restaurant);
    }

    [HttpPost("restaurants")]
    public async Task<IActionResult> CreateRestaurant([FromBody] CreateRestaurantDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var restaurant = await ownerService.CreateRestaurantAsync(dto, currentUser.Id);
            return CreatedAtAction(nameof(GetRestaurantById), new { restaurantId = restaurant.Id }, restaurant);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("restaurants/{restaurantId}")]
    public async Task<IActionResult> UpdateRestaurant(string restaurantId, [FromBody] UpdateRestaurantDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var restaurant = await ownerService.UpdateRestaurantAsync(restaurantId, dto, currentUser.Id);
            return Ok(restaurant);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpDelete("restaurants/{restaurantId}")]
    public async Task<IActionResult> DeleteRestaurant(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            await ownerService.DeleteRestaurantAsync(restaurantId, currentUser.Id);
            return Ok(new { Message = "Restaurant deleted successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    #endregion

    #region Dashboard & Statistics

    [HttpGet("restaurants/{restaurantId}/dashboard")]
    public async Task<IActionResult> GetDashboard(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var dashboard = await ownerService.GetDashboardDataAsync(restaurantId, currentUser.Id);
            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/statistics")]
    public async Task<IActionResult> GetStatistics(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var statistics = await ownerService.GetStatisticsAsync(restaurantId, currentUser.Id);
            return Ok(statistics);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/top-selling-items")]
    public async Task<IActionResult> GetTopSellingItems(string restaurantId, [FromQuery] int count = 10)
    {
        var topItems = await ownerService.GetTopSellingItemsAsync(restaurantId, count);
        return Ok(topItems);
    }

    [HttpGet("restaurants/{restaurantId}/revenue-chart")]
    public async Task<IActionResult> GetRevenueChart(string restaurantId, [FromQuery] int days = 30)
    {
        var revenueChart = await ownerService.GetRevenueChartDataAsync(restaurantId, days);
        return Ok(revenueChart);
    }

    [HttpGet("restaurants/{restaurantId}/total-revenue")]
    public async Task<IActionResult> GetTotalRevenue(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var revenue = await ownerService.GetTotalRevenueAsync(restaurantId, currentUser.Id);
            return Ok(new { TotalRevenue = revenue });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/today-revenue")]
    public async Task<IActionResult> GetTodayRevenue(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var revenue = await ownerService.GetTodayRevenueAsync(restaurantId, currentUser.Id);
            return Ok(new { TodayRevenue = revenue });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    #endregion

    #region Reports

    [HttpGet("restaurants/{restaurantId}/sales-report")]
    public async Task<IActionResult> GetSalesReport(
        string restaurantId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var report = await ownerService.GetSalesReportAsync(restaurantId, startDate, endDate, currentUser.Id);
            return Ok(report);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/orders-by-date-range")]
    public async Task<IActionResult> GetOrdersByDateRange(
        string restaurantId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var orders = await ownerService.GetOrdersByDateRangeAsync(restaurantId, startDate, endDate, currentUser.Id);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/category-sales")]
    public async Task<IActionResult> GetCategorySales(
        string restaurantId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var categorySales = await ownerService.GetCategorySalesAsync(restaurantId, startDate, endDate, currentUser.Id);
            return Ok(categorySales);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    #endregion

    #region Employee Management

    [HttpGet("restaurants/{restaurantId}/employees")]
    public async Task<IActionResult> GetEmployees(
        string restaurantId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var employees = await ownerService.GetEmployeesAsync(restaurantId, currentUser.Id, pageNumber, pageSize);
            return Ok(employees);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/employees/{employeeId}")]
    public async Task<IActionResult> GetEmployeeById(string restaurantId, string employeeId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var employee = await ownerService.GetEmployeeByIdAsync(restaurantId, employeeId, currentUser.Id);
            if (employee == null)
                return NotFound(new { Message = "Employee not found" });

            return Ok(employee);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("restaurants/{restaurantId}/employees")]
    public async Task<IActionResult> CreateEmployee(string restaurantId, [FromBody] CreateEmployeeDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var employee = await ownerService.CreateEmployeeAsync(restaurantId, dto, currentUser.Id);
            return CreatedAtAction(nameof(GetEmployeeById), new { restaurantId, employeeId = employee.Id }, employee);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("restaurants/{restaurantId}/employees/{employeeId}")]
    public async Task<IActionResult> UpdateEmployee(
        string restaurantId,
        string employeeId,
        [FromBody] UpdateEmployeeDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var employee = await ownerService.UpdateEmployeeAsync(restaurantId, employeeId, dto, currentUser.Id);
            return Ok(employee);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpDelete("restaurants/{restaurantId}/employees/{employeeId}")]
    public async Task<IActionResult> DeleteEmployee(string restaurantId, string employeeId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            await ownerService.DeleteEmployeeAsync(restaurantId, employeeId, currentUser.Id);
            return Ok(new { Message = "Employee deleted successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/employees/count")]
    public async Task<IActionResult> GetEmployeeCount(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var count = await ownerService.GetEmployeeCountAsync(restaurantId, currentUser.Id);
            return Ok(new { Count = count });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    #endregion

    #region Job Applications

    [HttpGet("restaurants/{restaurantId}/job-applications")]
    public async Task<IActionResult> GetJobApplications(
        string restaurantId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var applications = await ownerService.GetJobApplicationsAsync(restaurantId, currentUser.Id, pageNumber, pageSize);
            return Ok(applications);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/job-applications/pending")]
    public async Task<IActionResult> GetPendingJobApplications(
        string restaurantId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var applications = await ownerService.GetPendingJobApplicationsAsync(restaurantId, currentUser.Id, pageNumber, pageSize);
            return Ok(applications);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("job-applications/{applicationId}")]
    public async Task<IActionResult> GetJobApplicationById(string applicationId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var application = await ownerService.GetJobApplicationByIdAsync(applicationId, currentUser.Id);
            if (application == null)
                return NotFound(new { Message = "Application not found" });

            return Ok(application);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("job-applications/{applicationId}/accept")]
    public async Task<IActionResult> AcceptJobApplication(string applicationId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            await ownerService.AcceptJobApplicationAsync(applicationId, currentUser.Id);
            return Ok(new { Message = "Application accepted successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("job-applications/{applicationId}/reject")]
    public async Task<IActionResult> RejectJobApplication(
        string applicationId,
        [FromBody] string? rejectionReason = null)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            await ownerService.RejectJobApplicationAsync(applicationId, currentUser.Id, rejectionReason);
            return Ok(new { Message = "Application rejected successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/job-applications/pending/count")]
    public async Task<IActionResult> GetPendingApplicationsCount(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var count = await ownerService.GetPendingApplicationsCountAsync(restaurantId, currentUser.Id);
            return Ok(new { Count = count });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    #endregion

    #region Reviews

    [HttpGet("restaurants/{restaurantId}/reviews")]
    public async Task<IActionResult> GetRestaurantReviews(
        string restaurantId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var reviews = await ownerService.GetRestaurantReviewsAsync(restaurantId, currentUser.Id, pageNumber, pageSize);
            return Ok(reviews);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/reviews/pending")]
    public async Task<IActionResult> GetPendingReviews(
        string restaurantId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var reviews = await ownerService.GetPendingReviewsAsync(restaurantId, currentUser.Id, pageNumber, pageSize);
            return Ok(reviews);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("reviews/{reviewId}")]
    public async Task<IActionResult> GetReviewById(string reviewId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var review = await ownerService.GetReviewByIdAsync(reviewId, currentUser.Id);
            if (review == null)
                return NotFound(new { Message = "Review not found" });

            return Ok(review);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("reviews/{reviewId}/respond")]
    public async Task<IActionResult> RespondToReview(string reviewId, [FromBody] RespondToReviewRequest request)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            await ownerService.RespondToReviewAsync(reviewId, request.Response, currentUser.Id);
            return Ok(new { Message = "Response submitted successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("reviews/{reviewId}/report")]
    public async Task<IActionResult> ReportReview(string reviewId, [FromBody] ReportReviewRequest request)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            await ownerService.ReportReviewAsync(reviewId, request.Reason, currentUser.Id);
            return Ok(new { Message = "Review reported to admin successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/reviews/pending/count")]
    public async Task<IActionResult> GetPendingReviewsCount(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var count = await ownerService.GetPendingReviewsCountAsync(restaurantId, currentUser.Id);
            return Ok(new { Count = count });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/average-rating")]
    public async Task<IActionResult> GetAverageRating(string restaurantId)
    {
        var rating = await ownerService.GetAverageRatingAsync(restaurantId);
        return Ok(new { AverageRating = rating });
    }

    #endregion

    #region Orders

    [HttpGet("restaurants/{restaurantId}/orders")]
    public async Task<IActionResult> GetRestaurantOrders(
        string restaurantId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var orders = await ownerService.GetRestaurantOrdersAsync(restaurantId, currentUser.Id, pageNumber, pageSize);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/orders/status/{status}")]
    public async Task<IActionResult> GetOrdersByStatus(
        string restaurantId,
        OrderStatus status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var orders = await ownerService.GetOrdersByStatusAsync(restaurantId, status, currentUser.Id, pageNumber, pageSize);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("orders/{orderId}")]
    public async Task<IActionResult> GetOrderById(string orderId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var order = await ownerService.GetOrderByIdAsync(orderId, currentUser.Id);
            if (order == null)
                return NotFound(new { Message = "Order not found" });

            return Ok(order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("orders/{orderId}/status")]
    public async Task<IActionResult> UpdateOrderStatus(string orderId, [FromBody] OrderStatus newStatus)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var order = await ownerService.UpdateOrderStatusAsync(orderId, newStatus, currentUser.Id);
            return Ok(order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/orders/count")]
    public async Task<IActionResult> GetTotalOrdersCount(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var count = await ownerService.GetTotalOrdersCountAsync(restaurantId, currentUser.Id);
            return Ok(new { TotalOrders = count });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/orders/today/count")]
    public async Task<IActionResult> GetTodayOrdersCount(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var count = await ownerService.GetTodayOrdersCountAsync(restaurantId, currentUser.Id);
            return Ok(new { TodayOrders = count });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    #endregion

    #region Rewards

    [HttpGet("restaurants/{restaurantId}/rewards")]
    public async Task<IActionResult> GetRestaurantRewards(
        string restaurantId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var rewards = await ownerService.GetRestaurantRewardsAsync(restaurantId, currentUser.Id, pageNumber, pageSize);
            return Ok(rewards);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/rewards/{rewardId}")]
    public async Task<IActionResult> GetRewardById(string restaurantId, string rewardId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var reward = await ownerService.GetRewardByIdAsync(rewardId, currentUser.Id);
            if (reward == null)
                return NotFound(new { Message = "Reward not found" });

            return Ok(reward);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("restaurants/{restaurantId}/rewards")]
    public async Task<IActionResult> CreateReward(string restaurantId, [FromBody] CreateRewardDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var reward = await ownerService.CreateRewardAsync(restaurantId, dto, currentUser.Id);
            return CreatedAtAction(nameof(GetRewardById), new { restaurantId, rewardId = reward.Id }, reward);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("restaurants/{restaurantId}/rewards/{rewardId}")]
    public async Task<IActionResult> UpdateReward(string restaurantId, string rewardId, [FromBody] UpdateRewardDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var reward = await ownerService.UpdateRewardAsync(rewardId, dto, currentUser.Id);
            return Ok(reward);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpDelete("restaurants/{restaurantId}/rewards/{rewardId}")]
    public async Task<IActionResult> DeleteReward(string restaurantId, string rewardId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            await ownerService.DeleteRewardAsync(rewardId, currentUser.Id);
            return Ok(new { Message = "Reward deleted successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    #endregion

    #region Reservations

    [HttpGet("restaurants/{restaurantId}/reservations")]
    public async Task<IActionResult> GetRestaurantReservations(
        string restaurantId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var reservations = await ownerService.GetRestaurantReservationsAsync(restaurantId, currentUser.Id, pageNumber, pageSize);
            return Ok(reservations);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/reservations/status/{status}")]
    public async Task<IActionResult> GetReservationsByStatus(
        string restaurantId,
        ReservationStatus status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var reservations = await ownerService.GetReservationsByStatusAsync(restaurantId, status, currentUser.Id, pageNumber, pageSize);
            return Ok(reservations);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("reservations/{reservationId}")]
    public async Task<IActionResult> GetReservationById(string reservationId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var reservation = await ownerService.GetReservationByIdAsync(reservationId, currentUser.Id);
            if (reservation == null)
                return NotFound(new { Message = "Reservation not found" });

            return Ok(reservation);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("reservations/{reservationId}/status")]
    public async Task<IActionResult> UpdateReservationStatus(
        string reservationId,
        [FromBody] ReservationStatus newStatus)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var reservation = await ownerService.UpdateReservationStatusAsync(reservationId, newStatus, currentUser.Id);
            return Ok(reservation);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/reservations/active/count")]
    public async Task<IActionResult> GetActiveReservationsCount(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var count = await ownerService.GetActiveReservationsCountAsync(restaurantId, currentUser.Id);
            return Ok(new { ActiveReservations = count });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/reservations/today")]
    public async Task<IActionResult> GetTodayReservations(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var reservations = await ownerService.GetTodayReservationsAsync(restaurantId, currentUser.Id);
            return Ok(reservations);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    #endregion

    #region Menu Management

    [HttpGet("restaurants/{restaurantId}/menus")]
    public async Task<IActionResult> GetRestaurantMenus(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var menus = await ownerService.GetRestaurantMenusAsync(restaurantId, currentUser.Id);
            return Ok(menus);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("menus/{menuId}")]
    public async Task<IActionResult> GetMenuById(string menuId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var menu = await ownerService.GetMenuByIdAsync(menuId, currentUser.Id);
            if (menu == null)
                return NotFound(new { Message = "Menu not found" });

            return Ok(menu);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("restaurants/{restaurantId}/menus")]
    public async Task<IActionResult> CreateMenu(string restaurantId, [FromBody] CreateMenuDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var menu = await ownerService.CreateMenuAsync(restaurantId, dto, currentUser.Id);
            return CreatedAtAction(nameof(GetMenuById), new { menuId = menu.Id }, menu);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("menus/{menuId}")]
    public async Task<IActionResult> UpdateMenu(string menuId, [FromBody] UpdateMenuDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var menu = await ownerService.UpdateMenuAsync(menuId, dto, currentUser.Id);
            return Ok(menu);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpDelete("menus/{menuId}")]
    public async Task<IActionResult> DeleteMenu(string menuId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            await ownerService.DeleteMenuAsync(menuId, currentUser.Id);
            return Ok(new { Message = "Menu deleted successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    #endregion

    #region Menu Items

    [HttpGet("menus/{menuId}/items")]
    public async Task<IActionResult> GetMenuItems(
        string menuId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var menuItems = await ownerService.GetMenuItemsAsync(menuId, currentUser.Id, pageNumber, pageSize);
            return Ok(menuItems);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("menu-items/{menuItemId}")]
    public async Task<IActionResult> GetMenuItemById(string menuItemId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var menuItem = await ownerService.GetMenuItemByIdAsync(menuItemId, currentUser.Id);
            if (menuItem == null)
                return NotFound(new { Message = "Menu item not found" });

            return Ok(menuItem);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("menus/{menuId}/items")]
    public async Task<IActionResult> CreateMenuItem(string menuId, [FromBody] CreateMenuItemDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var menuItem = await ownerService.CreateMenuItemAsync(menuId, dto, currentUser.Id);
            return CreatedAtAction(nameof(GetMenuItemById), new { menuItemId = menuItem.Id }, menuItem);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("menu-items/{menuItemId}")]
    public async Task<IActionResult> UpdateMenuItem(string menuItemId, [FromBody] UpdateMenuItemDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var menuItem = await ownerService.UpdateMenuItemAsync(menuItemId, dto, currentUser.Id);
            return Ok(menuItem);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpDelete("menu-items/{menuItemId}")]
    public async Task<IActionResult> DeleteMenuItem(string menuItemId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            await ownerService.DeleteMenuItemAsync(menuItemId, currentUser.Id);
            return Ok(new { Message = "Menu item deleted successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPatch("menu-items/{menuItemId}/availability")]
    public async Task<IActionResult> UpdateMenuItemAvailability(
        string menuItemId,
        [FromBody] bool isAvailable)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            await ownerService.UpdateMenuItemAvailabilityAsync(menuItemId, isAvailable, currentUser.Id);
            return Ok(new { Message = "Menu item availability updated successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/menu-items/count")]
    public async Task<IActionResult> GetMenuItemsCount(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var count = await ownerService.GetMenuItemsCountAsync(restaurantId, currentUser.Id);
            return Ok(new { Count = count });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    #endregion

    #region Tables

    [HttpGet("restaurants/{restaurantId}/tables")]
    public async Task<IActionResult> GetRestaurantTables(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var tables = await ownerService.GetRestaurantTablesAsync(restaurantId, currentUser.Id);
            return Ok(tables);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("tables/{tableId}")]
    public async Task<IActionResult> GetTableById(string tableId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var table = await ownerService.GetTableByIdAsync(tableId, currentUser.Id);
            if (table == null)
                return NotFound(new { Message = "Table not found" });

            return Ok(table);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("restaurants/{restaurantId}/tables")]
    public async Task<IActionResult> CreateTable(string restaurantId, [FromBody] CreateTableDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var table = await ownerService.CreateTableAsync(restaurantId, dto, currentUser.Id);
            return CreatedAtAction(nameof(GetTableById), new { tableId = table.Id }, table);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("tables/{tableId}")]
    public async Task<IActionResult> UpdateTable(string tableId, [FromBody] UpdateTableDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var table = await ownerService.UpdateTableAsync(tableId, dto, currentUser.Id);
            return Ok(table);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpDelete("tables/{tableId}")]
    public async Task<IActionResult> DeleteTable(string tableId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            await ownerService.DeleteTableAsync(tableId, currentUser.Id);
            return Ok(new { Message = "Table deleted successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPatch("tables/{tableId}/status")]
    public async Task<IActionResult> UpdateTableStatus(string tableId, [FromBody] TableStatus newStatus)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var table = await ownerService.UpdateTableStatusAsync(tableId, newStatus, currentUser.Id);
            return Ok(table);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/tables/available/count")]
    public async Task<IActionResult> GetAvailableTablesCount(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var count = await ownerService.GetAvailableTablesCountAsync(restaurantId, currentUser.Id);
            return Ok(new { Count = count });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    #endregion

    #region Restaurant Applications

    [HttpPost("restaurant-applications")]
    public async Task<IActionResult> CreateRestaurantApplication([FromForm] CreateRestaurantApplicationDto dto, IFormFile? imageFile)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            string? imageUrl = null;
            if (imageFile != null)
            {
                imageUrl = await fileService.UploadFileAsync(imageFile, "restaurant-applications");
            }

            var application = new RestaurantApplication
            {
                Id = Guid.NewGuid().ToString(),
                OwnerId = currentUser.Id,
                RestaurantName = dto.RestaurantName,
                Description = dto.Description,
                Address = dto.Address,
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email,
                Website = dto.Website,
                Category = dto.Category,
                AdditionalNotes = dto.AdditionalNotes,
                ImageUrl = imageUrl,
                Status = RestaurantApplicationStatus.Pending,
                ApplicationDate = DateTime.UtcNow
            };

            context.RestaurantApplications.Add(application);
            await context.SaveChangesAsync();

            return Ok(new { Message = "Restaurant application submitted successfully. Waiting for admin approval.", ApplicationId = application.Id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurant-applications")]
    public async Task<IActionResult> GetMyRestaurantApplications()
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var applications = await context.RestaurantApplications
                .Where(a => a.OwnerId == currentUser.Id && !a.IsDeleted)
                .OrderByDescending(a => a.ApplicationDate)
                .Select(a => new RestaurantApplicationDto
                {
                    Id = a.Id,
                    OwnerId = a.OwnerId,
                    OwnerName = a.Owner.FullName,
                    OwnerEmail = a.Owner.Email!,
                    RestaurantName = a.RestaurantName,
                    Description = a.Description,
                    Address = a.Address,
                    PhoneNumber = a.PhoneNumber,
                    Email = a.Email,
                    Website = a.Website,
                    Category = a.Category,
                    ImageUrl = a.ImageUrl,
                    AdditionalNotes = a.AdditionalNotes,
                    Status = a.Status.ToString(),
                    ApplicationDate = a.ApplicationDate,
                    ReviewedAt = a.ReviewedAt,
                    ReviewedBy = a.ReviewedBy,
                    ReviewerName = a.Reviewer != null ? a.Reviewer.FullName : null,
                    RejectionReason = a.RejectionReason,
                    CreatedRestaurantId = a.CreatedRestaurantId
                })
                .ToListAsync();

            return Ok(applications);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurant-applications/{applicationId}")]
    public async Task<IActionResult> GetRestaurantApplicationById(string applicationId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {

            var application = await context.RestaurantApplications
                .Where(a => a.Id == applicationId && a.OwnerId == currentUser.Id && !a.IsDeleted)
                .Select(a => new RestaurantApplicationDto
                {
                    Id = a.Id,
                    OwnerId = a.OwnerId,
                    OwnerName = a.Owner.FullName,
                    OwnerEmail = a.Owner.Email!,
                    RestaurantName = a.RestaurantName,
                    Description = a.Description,
                    Address = a.Address,
                    PhoneNumber = a.PhoneNumber,
                    Email = a.Email,
                    Website = a.Website,
                    Category = a.Category,
                    ImageUrl = a.ImageUrl,
                    AdditionalNotes = a.AdditionalNotes,
                    Status = a.Status.ToString(),
                    ApplicationDate = a.ApplicationDate,
                    ReviewedAt = a.ReviewedAt,
                    ReviewedBy = a.ReviewedBy,
                    ReviewerName = a.Reviewer != null ? a.Reviewer.FullName : null,
                    RejectionReason = a.RejectionReason,
                    CreatedRestaurantId = a.CreatedRestaurantId
                })
                .FirstOrDefaultAsync();

            if (application == null)
                return NotFound(new { Message = "Application not found" });

            return Ok(application);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    #endregion

}

public class RespondToReviewRequest
{
    public string Response { get; set; } = string.Empty;
}

public class ReportReviewRequest
{
    public string Reason { get; set; } = string.Empty;
}
