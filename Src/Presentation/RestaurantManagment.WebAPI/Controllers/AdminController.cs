using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantManagment.Application.Common.Interfaces;

namespace RestaurantManagment.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Artık düzgün çalışacak
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        /// <summary>
        /// Admin dashboard istatistiklerini getirir
        /// </summary>
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
                return StatusCode(500, new { message = "Dashboard verileri yüklenirken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// Kullanıcıları sayfalı olarak getirir
        /// </summary>
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
                return StatusCode(500, new { message = "Kullanıcılar yüklenirken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// Restoranları sayfalı olarak getirir
        /// </summary>
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
                return StatusCode(500, new { message = "Restoranlar yüklenirken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// Restoran sahibi başvurularını sayfalı olarak getirir
        /// </summary>
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
                return StatusCode(500, new { message = "Başvurular yüklenirken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// Bekleyen restoran sahibi başvurularını getirir
        /// </summary>
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
                return StatusCode(500, new { message = "Başvurular yüklenirken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// Belirli bir başvuruyu getirir
        /// </summary>
        [HttpGet("applications/{id}")]
        public async Task<IActionResult> GetApplication(int id)
        {
            try
            {
                var application = await _adminService.GetApplicationByIdAsync(id);
                if (application == null)
                    return NotFound(new { message = "Başvuru bulunamadı." });

                return Ok(application);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Başvuru yüklenirken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// Restoran sahibi başvurusunu onaylar
        /// </summary>
        [HttpPost("applications/{id}/approve")]
        public async Task<IActionResult> ApproveApplication(int id)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "Kullanıcı kimliği bulunamadı." });

                await _adminService.ApproveApplicationAsync(id, userId);
                return Ok(new { message = "Başvuru onaylandı." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Başvuru onaylanırken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// Restoran sahibi başvurusunu reddeder
        /// </summary>
        [HttpPost("applications/{id}/reject")]
        public async Task<IActionResult> RejectApplication(int id, [FromBody] RejectApplicationRequest request)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "Kullanıcı kimliği bulunamadı." });

                if (string.IsNullOrEmpty(request.Reason))
                    return BadRequest(new { message = "Red sebebi belirtilmelidir." });

                await _adminService.RejectApplicationAsync(id, userId, request.Reason);
                return Ok(new { message = "Başvuru reddedildi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Başvuru reddedilirken bir hata oluştu.", error = ex.Message });
            }
        }
    }

    public class RejectApplicationRequest
    {
        public string Reason { get; set; } = string.Empty;
    }
}
