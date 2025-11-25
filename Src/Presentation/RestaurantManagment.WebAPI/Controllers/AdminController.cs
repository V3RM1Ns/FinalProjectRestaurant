using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantManagment.Application.Common.Interfaces;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using RestaurantManagment.Application.Common.DTOs.Restaurant;

namespace RestaurantManagment.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] 
    public class AdminController(IAdminService adminService, IEmailService emailService) : ControllerBase
    {
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var dashboardData = await adminService.GetAdminDashboardDataAsync();
                return Ok(dashboardData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while loading the dashboard data.", error = ex.Message });
            }
        }

      
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 5)
        {
            try
            {
                var result = await adminService.GetUsersAsync(pageNumber, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while loading the users.", error = ex.Message });
            }
        }

      
        [HttpGet("restaurants")]
        public async Task<IActionResult> GetRestaurants([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 5)
        {
            try
            {
                var result = await adminService.GetRestaurantsAsync(pageNumber, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while loading the restaurants.", error = ex.Message });
            }
        }

      
        [HttpGet("applications")]
        public async Task<IActionResult> GetApplications([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 5)
        {
            try
            {
                var result = await adminService.GetOwnershipApplicationsAsync(pageNumber, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while loading the applications.", error = ex.Message });
            }
        }

      
        [HttpGet("applications/pending")]
        public async Task<IActionResult> GetPendingApplications()
        {
            try
            {
                var applications = await adminService.GetPendingApplicationsAsync();
                return Ok(applications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while loading the applications.", error = ex.Message });
            }  
        }

     
        [HttpGet("applications/{id}")]
        public async Task<IActionResult> GetApplication(string id)
        {
            try
            {
                var application = await adminService.GetApplicationByIdAsync(id);
                if (application == null)
                    return NotFound(new { message = "Application not found." });

                return Ok(application);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while loading the application.", error = ex.Message });
            }
        }

     
        [HttpPost("applications/{id}/approve")]
        public async Task<IActionResult> ApproveApplication(string id)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "User ID not found." });

                await adminService.ApproveApplicationAsync(id, userId);
                return Ok(new { message = "Application approved." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while approving the application.", error = ex.Message });
            }
        }

     
        [HttpPost("applications/{id}/reject")]
        public async Task<IActionResult> RejectApplication(string id, [FromBody] RejectApplicationRequest request)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "User ID not found." });

                if (string.IsNullOrEmpty(request.Reason))
                    return BadRequest(new { message = "Rejection reason must be specified." });

                await adminService.RejectApplicationAsync(id, userId, request.Reason);
                return Ok(new { message = "Application rejected." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while rejecting the application.", error = ex.Message });
            }
        }
        
        [HttpPost("users/{userId}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(string userId)
        {
            try
            {
                await adminService.ToggleUserActiveStatusAsync(userId);
                return Ok(new { message = "User status updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating user status.", error = ex.Message });
            }
        }

        [HttpGet("users/{userId}/roles")]
        public async Task<IActionResult> GetUserRoles(string userId)
        {
            try
            {
                var roles = await adminService.GetUserRolesAsync(userId);
                return Ok(new { roles });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching user roles.", error = ex.Message });
            }
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetAllRoles()
        {
            try
            {
                var roles = await adminService.GetAllRolesAsync();
                return Ok(new { roles });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching roles.", error = ex.Message });
            }
        }

        [HttpPost("users/{userId}/roles")]
        public async Task<IActionResult> AddRoleToUser(string userId, [FromBody] RoleRequest request)
        {
            try
            {
                await adminService.AddRoleToUserAsync(userId, request.Role);
                return Ok(new { message = $"Role '{request.Role}' added successfully." });
            }
            catch (Exception ex)
            {
              
                return StatusCode(500, new { message = "An error occurred while adding role.", error = ex.Message });
            }
        }

        [HttpDelete("users/{userId}/roles/{role}")]
        public async Task<IActionResult> RemoveRoleFromUser(string userId, string role)
        {
            try
            {
                await adminService.RemoveRoleFromUserAsync(userId, role);
                return Ok(new { message = $"Role '{role}' removed successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while removing role.", error = ex.Message });
            }
        }
        
        [HttpPost("restaurants/{restaurantId}/toggle-status")]
        public async Task<IActionResult> ToggleRestaurantStatus(string restaurantId)
        {
            try
            {
                await adminService.ToggleRestaurantActiveStatusAsync(restaurantId);
                return Ok(new { message = "Restaurant status updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating restaurant status.", error = ex.Message });
            }
        }

        [HttpGet("restaurants/{restaurantId}")]
        public async Task<IActionResult> GetRestaurantById(string restaurantId)
        {
            try
            {
                var restaurant = await adminService.GetRestaurantByIdAsync(restaurantId);
                if (restaurant == null)
                    return NotFound(new { message = "Restaurant not found." });

                return Ok(restaurant);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while loading the restaurant.", error = ex.Message });
            }
        }

        [HttpPut("restaurants/{restaurantId}")]
        public async Task<IActionResult> UpdateRestaurant(string restaurantId, [FromForm] UpdateRestaurantDto dto)
        {
            try
            {
                await adminService.UpdateRestaurantAsync(restaurantId, dto);
                return Ok(new { message = "Restaurant updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the restaurant.", error = ex.Message });
            }
        }

        [HttpGet("restaurants/categories")]
        public async Task<IActionResult> GetAllRestaurantCategories()
        {
            try
            {
                var categories = await adminService.GetAllRestaurantCategoriesAsync();
                return Ok(new { categories });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching categories.", error = ex.Message });
            }
        }

        [HttpPost("restaurants/{restaurantId}/category")]
        public async Task<IActionResult> UpdateRestaurantCategory(string restaurantId, [FromBody] UpdateCategoryRequest request)
        {
            try
            {
                await adminService.UpdateRestaurantCategoryAsync(restaurantId, request.CategoryId);
                return Ok(new { message = "Restaurant category updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating restaurant category.", error = ex.Message });
            }
        }


        [HttpGet("reviews")]
        public async Task<IActionResult> GetAllReviews([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await adminService.GetAllReviewsAsync(pageNumber, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while loading reviews.", error = ex.Message });
            }
        }

        [HttpGet("reviews/pending")]
        public async Task<IActionResult> GetPendingReviews([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await adminService.GetPendingReviewsAsync(pageNumber, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while loading pending reviews.", error = ex.Message });
            }
        }

        [HttpGet("reviews/reported")]
        public async Task<IActionResult> GetReportedReviews([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await adminService.GetReportedReviewsAsync(pageNumber, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while loading reported reviews.", error = ex.Message });
            }
        }

        [HttpGet("reviews/{reviewId}")]
        public async Task<IActionResult> GetReviewById(string reviewId)
        {
            try
            {
                var review = await adminService.GetReviewByIdAsync(reviewId);
                if (review == null)
                    return NotFound(new { message = "Review not found." });

                return Ok(review);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while loading the review.", error = ex.Message });
            }
        }

        [HttpPost("reviews/{reviewId}/approve")]
        public async Task<IActionResult> ApproveReview(string reviewId)
        {
            try
            {
                var context = HttpContext.RequestServices.GetService<RestaurantManagment.Persistance.Data.AppDbContext>();
                if (context != null)
                {
                    var review = await context.Reviews
                        .Include(r => r.Customer)
                        .Include(r => r.Restaurant)
                        .FirstOrDefaultAsync(r => r.Id == reviewId);
                    
                    if (review != null && review.Customer != null && review.Restaurant != null && review.Customer.Email != null)
                    {
                        await adminService.ApproveReviewAsync(reviewId);
                        
                        try
                        {
                            await emailService.SendReviewApprovedEmailAsync(
                                review.Customer.Email,
                                review.Customer.FullName ?? review.Customer.UserName ?? "Müşteri",
                                review.Restaurant.Name,
                                review.Rating
                            );
                        }
                        catch (Exception emailEx)
                        {
                            Console.WriteLine($"Failed to send review approval email: {emailEx.Message}");
                        }
                        
                        return Ok(new { message = "Review approved successfully." });
                    }
                }
                
                await adminService.ApproveReviewAsync(reviewId);
                return Ok(new { message = "Review approved successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while approving the review.", error = ex.Message });
            }
        }

        [HttpPost("reviews/{reviewId}/reject")]
        public async Task<IActionResult> RejectReview(string reviewId, [FromBody] RejectReviewRequest request)
        {
            try
            {
                var context = HttpContext.RequestServices.GetService<RestaurantManagment.Persistance.Data.AppDbContext>();
                if (context != null)
                {
                    var review = await context.Reviews
                        .Include(r => r.Customer)
                        .Include(r => r.Restaurant)
                        .FirstOrDefaultAsync(r => r.Id == reviewId);
                    
                    if (review != null && review.Customer != null && review.Restaurant != null && review.Customer.Email != null)
                    {
                        await adminService.RejectReviewAsync(reviewId, request.Reason);
                
                        try
                        {
                            await emailService.SendReviewRejectedEmailAsync(
                                review.Customer.Email,
                                review.Customer.FullName ?? review.Customer.UserName ?? "Müşteri",
                                review.Restaurant.Name,
                                request.Reason
                            );
                        }
                        catch (Exception emailEx)
                        {
                            Console.WriteLine($"Failed to send review rejection email: {emailEx.Message}");
                        }
                        
                        return Ok(new { message = "Review rejected successfully." });
                    }
                }
                
                await adminService.RejectReviewAsync(reviewId, request.Reason);
                return Ok(new { message = "Review rejected successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while rejecting the review.", error = ex.Message });
            }
        }

        [HttpDelete("reviews/{reviewId}")]
        public async Task<IActionResult> DeleteReview(string reviewId)
        {
            try
            {
                await adminService.DeleteReviewAsync(reviewId);
                return Ok(new { message = "Review deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the review.", error = ex.Message });
            }
        }
 
        #region Restaurant Applications

        [HttpGet("restaurant-applications")]
        public async Task<IActionResult> GetRestaurantApplications([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var context = HttpContext.RequestServices.GetService<RestaurantManagment.Persistance.Data.AppDbContext>();
                if (context == null)
                    return StatusCode(500, new { message = "Database context not available" });

                var query = context.RestaurantApplications
                    .Where(a => !a.IsDeleted)
                    .OrderByDescending(a => a.ApplicationDate);

                var totalCount = await query.CountAsync();
                var applications = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(a => new
                    {
                        a.Id,
                        a.OwnerId,
                        OwnerName = a.Owner.FullName,
                        OwnerEmail = a.Owner.Email,
                        a.RestaurantName,
                        a.Description,
                        a.Address,
                        a.PhoneNumber,
                        a.Email,
                        a.Website,
                        a.Category,
                        a.ImageUrl,
                        a.AdditionalNotes,
                        Status = a.Status.ToString(),
                        a.ApplicationDate,
                        a.ReviewedAt,
                        a.ReviewedBy,
                        ReviewerName = a.Reviewer != null ? a.Reviewer.FullName : null,
                        a.RejectionReason,
                        a.CreatedRestaurantId
                    })
                    .ToListAsync();

                return Ok(new { applications, totalCount, pageNumber, pageSize });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while loading restaurant applications.", error = ex.Message });
            }
        }

        [HttpGet("restaurant-applications/pending")]
        public async Task<IActionResult> GetPendingRestaurantApplications()
        {
            try
            {
                var context = HttpContext.RequestServices.GetService<RestaurantManagment.Persistance.Data.AppDbContext>();
                if (context == null)
                    return StatusCode(500, new { message = "Database context not available" });

                var applications = await context.RestaurantApplications
                    .Where(a => a.Status == RestaurantManagment.Domain.Models.RestaurantApplicationStatus.Pending && !a.IsDeleted)
                    .OrderBy(a => a.ApplicationDate)
                    .Select(a => new
                    {
                        a.Id,
                        a.OwnerId,
                        OwnerName = a.Owner.FullName,
                        OwnerEmail = a.Owner.Email,
                        a.RestaurantName,
                        a.Description,
                        a.Address,
                        a.PhoneNumber,
                        a.Email,
                        a.Website,
                        a.Category,
                        a.ImageUrl,
                        a.AdditionalNotes,
                        Status = a.Status.ToString(),
                        a.ApplicationDate
                    })
                    .ToListAsync();

                return Ok(applications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while loading pending restaurant applications.", error = ex.Message });
            }
        }

        [HttpGet("restaurant-applications/{id}")]
        public async Task<IActionResult> GetRestaurantApplication(string id)
        {
            try
            {
                var context = HttpContext.RequestServices.GetService<RestaurantManagment.Persistance.Data.AppDbContext>();
                if (context == null)
                    return StatusCode(500, new { message = "Database context not available" });

                var application = await context.RestaurantApplications
                    .Where(a => a.Id == id && !a.IsDeleted)
                    .Select(a => new
                    {
                        a.Id,
                        a.OwnerId,
                        OwnerName = a.Owner.FullName,
                        OwnerEmail = a.Owner.Email,
                        a.RestaurantName,
                        a.Description,
                        a.Address,
                        a.PhoneNumber,
                        a.Email,
                        a.Website,
                        a.Category,
                        a.ImageUrl,
                        a.AdditionalNotes,
                        Status = a.Status.ToString(),
                        a.ApplicationDate,
                        a.ReviewedAt,
                        a.ReviewedBy,
                        ReviewerName = a.Reviewer != null ? a.Reviewer.FullName : null,
                        a.RejectionReason,
                        a.CreatedRestaurantId
                    })
                    .FirstOrDefaultAsync();

                if (application == null)
                    return NotFound(new { message = "Restaurant application not found." });

                return Ok(application);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while loading the restaurant application.", error = ex.Message });
            }
        }

        [HttpPost("restaurant-applications/{id}/approve")]
        public async Task<IActionResult> ApproveRestaurantApplication(string id)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "User ID not found." });

                var context = HttpContext.RequestServices.GetService<RestaurantManagment.Persistance.Data.AppDbContext>();
                if (context == null)
                    return StatusCode(500, new { message = "Database context not available" });

                var application = await context.RestaurantApplications
                    .Include(a => a.Owner)
                    .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);

                if (application == null)
                    return NotFound(new { message = "Application not found." });

                if (application.Status != RestaurantManagment.Domain.Models.RestaurantApplicationStatus.Pending)
                    return BadRequest(new { message = "Application has already been reviewed." });

                var restaurant = new RestaurantManagment.Domain.Models.Restaurant
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = application.RestaurantName,
                    Description = application.Description,
                    Address = application.Address,
                    PhoneNumber = application.PhoneNumber,
                    Email = application.Email,
                    Website = application.Website,
                    Category = null,
                    ImageUrl = application.ImageUrl,
                    OwnerId = application.OwnerId,
                    CreatedAt = DateTime.UtcNow
                };

                context.Restaurants.Add(restaurant);
                application.Status = RestaurantManagment.Domain.Models.RestaurantApplicationStatus.Approved;
                application.ReviewedAt = DateTime.UtcNow;
                application.ReviewedBy = userId;
                application.CreatedRestaurantId = restaurant.Id;

                await context.SaveChangesAsync();

                return Ok(new { message = "Restaurant application approved and restaurant created successfully.", restaurantId = restaurant.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while approving the restaurant application.", error = ex.Message });
            }
        }

        [HttpPost("restaurant-applications/{id}/reject")]
        public async Task<IActionResult> RejectRestaurantApplication(string id, [FromBody] RejectApplicationRequest request)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "User ID not found." });

                if (string.IsNullOrEmpty(request.Reason))
                    return BadRequest(new { message = "Rejection reason must be specified." });

                var context = HttpContext.RequestServices.GetService<RestaurantManagment.Persistance.Data.AppDbContext>();
                if (context == null)
                    return StatusCode(500, new { message = "Database context not available" });

                var application = await context.RestaurantApplications
                    .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);

                if (application == null)
                    return NotFound(new { message = "Application not found." });

                if (application.Status != RestaurantManagment.Domain.Models.RestaurantApplicationStatus.Pending)
                    return BadRequest(new { message = "Application has already been reviewed." });

                application.Status = RestaurantManagment.Domain.Models.RestaurantApplicationStatus.Rejected;
                application.ReviewedAt = DateTime.UtcNow;
                application.ReviewedBy = userId;
                application.RejectionReason = request.Reason;

                await context.SaveChangesAsync();

                return Ok(new { message = "Restaurant application rejected." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while rejecting the restaurant application.", error = ex.Message });
            }
        }

        #endregion
    }

    public class RejectApplicationRequest
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class RoleRequest
    {
        public string Role { get; set; } = string.Empty;
    }

    public class RejectReviewRequest
    {
        [Required(ErrorMessage = "Rejection reason is required.")]
        [MinLength(10, ErrorMessage = "Rejection reason must be at least 10 characters.")]
        public string Reason { get; set; } = string.Empty;
    }

    public class UpdateCategoryRequest
    {
        public int CategoryId { get; set; }
    }
}
