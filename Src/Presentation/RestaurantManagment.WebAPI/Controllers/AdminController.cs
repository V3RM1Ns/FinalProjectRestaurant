using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantManagment.Application.Common.Interfaces;

namespace RestaurantManagment.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] 
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

       
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var dashboardData = await _adminService.GetAdminDashboardDataAsync();
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
                var result = await _adminService.GetUsersAsync(pageNumber, pageSize);
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
                var result = await _adminService.GetRestaurantsAsync(pageNumber, pageSize);
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
                var result = await _adminService.GetOwnershipApplicationsAsync(pageNumber, pageSize);
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
                var applications = await _adminService.GetPendingApplicationsAsync();
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
                var application = await _adminService.GetApplicationByIdAsync(id);
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

                await _adminService.ApproveApplicationAsync(id, userId);
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

                await _adminService.RejectApplicationAsync(id, userId, request.Reason);
                return Ok(new { message = "Application rejected." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while rejecting the application.", error = ex.Message });
            }
        }

        // User management endpoints
        [HttpPost("users/{userId}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(string userId)
        {
            try
            {
                await _adminService.ToggleUserActiveStatusAsync(userId);
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
                var roles = await _adminService.GetUserRolesAsync(userId);
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
                var roles = await _adminService.GetAllRolesAsync();
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
                await _adminService.AddRoleToUserAsync(userId, request.Role);
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
                await _adminService.RemoveRoleFromUserAsync(userId, role);
                return Ok(new { message = $"Role '{role}' removed successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while removing role.", error = ex.Message });
            }
        }

        // Restaurant management endpoints
        [HttpPost("restaurants/{restaurantId}/toggle-status")]
        public async Task<IActionResult> ToggleRestaurantStatus(string restaurantId)
        {
            try
            {
                await _adminService.ToggleRestaurantActiveStatusAsync(restaurantId);
                return Ok(new { message = "Restaurant status updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating restaurant status.", error = ex.Message });
            }
        }
    }

    public class RejectApplicationRequest
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class RoleRequest
    {
        public string Role { get; set; } = string.Empty;
    }
}
