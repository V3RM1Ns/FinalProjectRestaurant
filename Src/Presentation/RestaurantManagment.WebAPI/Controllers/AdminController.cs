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
        public async Task<IActionResult> GetApplication(int id)
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
        public async Task<IActionResult> ApproveApplication(int id)
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
        public async Task<IActionResult> RejectApplication(int id, [FromBody] RejectApplicationRequest request)
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
    }

    public class RejectApplicationRequest
    {
        public string Reason { get; set; } = string.Empty;
    }
}
