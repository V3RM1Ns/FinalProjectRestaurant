using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RestaurantManagment.Application.Common.DTOs.Menu;
using RestaurantManagment.Application.Common.DTOs.MenuItem;
using RestaurantManagment.Application.Common.DTOs.Owner;
using RestaurantManagment.Application.Common.DTOs.Restaurant;
using RestaurantManagment.Application.Common.DTOs.Order;
using RestaurantManagment.Application.Common.Interfaces;
using RestaurantManagment.Domain.Models;
using RestaurantManagment.Domain.Enums;

namespace RestaurantManagment.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Employee")]
public class EmployeeController(
    IEmployeeService employeeService,
    IOrderService orderService,
    UserManager<AppUser> userManager) : ControllerBase
{
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
            var reservations = await employeeService.GetRestaurantReservationsAsync(restaurantId, currentUser.Id, pageNumber, pageSize);
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
        string status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            if (!Enum.TryParse<ReservationStatus>(status, true, out var reservationStatus))
                return BadRequest(new { Message = "Invalid status value" });

            var reservations = await employeeService.GetReservationsByStatusAsync(restaurantId, reservationStatus, currentUser.Id, pageNumber, pageSize);
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
            var reservation = await employeeService.GetReservationByIdAsync(reservationId, currentUser.Id);
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
        [FromBody] string newStatus)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            if (!Enum.TryParse<ReservationStatus>(newStatus, true, out var reservationStatus))
                return BadRequest(new { Message = "Invalid status value" });

            var reservation = await employeeService.UpdateReservationStatusAsync(reservationId, reservationStatus, currentUser.Id);
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
            var count = await employeeService.GetActiveReservationsCountAsync(restaurantId, currentUser.Id);
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
            var reservations = await employeeService.GetTodayReservationsAsync(restaurantId, currentUser.Id);
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
            var menus = await employeeService.GetRestaurantMenusAsync(restaurantId, currentUser.Id);
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
            var menu = await employeeService.GetMenuByIdAsync(menuId, currentUser.Id);
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
            var menu = await employeeService.CreateMenuAsync(restaurantId, dto, currentUser.Id);
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
            var menu = await employeeService.UpdateMenuAsync(menuId, dto, currentUser.Id);
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
            await employeeService.DeleteMenuAsync(menuId, currentUser.Id);
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
            var menuItems = await employeeService.GetMenuItemsAsync(menuId, currentUser.Id, pageNumber, pageSize);
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
            var menuItem = await employeeService.GetMenuItemByIdAsync(menuItemId, currentUser.Id);
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
            var menuItem = await employeeService.CreateMenuItemAsync(menuId, dto, currentUser.Id);
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
            var menuItem = await employeeService.UpdateMenuItemAsync(menuItemId, dto, currentUser.Id);
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
            await employeeService.DeleteMenuItemAsync(menuItemId, currentUser.Id);
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
            await employeeService.UpdateMenuItemAvailabilityAsync(menuItemId, isAvailable, currentUser.Id);
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
            var count = await employeeService.GetMenuItemsCountAsync(restaurantId, currentUser.Id);
            return Ok(new { Count = count });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("menu-items/upload-image")]
    public async Task<IActionResult> UploadMenuItemImage([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { Message = "No file provided" });

        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { Message = "Invalid file type. Only images are allowed." });
            
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { Message = "File size exceeds 5MB limit." });
            
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "menu-items");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);
            
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
 
            var imageUrl = $"/uploads/menu-items/{uniqueFileName}";
            return Ok(new { imageUrl = imageUrl });
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
            var tables = await employeeService.GetRestaurantTablesAsync(restaurantId, currentUser.Id);
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
            var table = await employeeService.GetTableByIdAsync(tableId, currentUser.Id);
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
            var table = await employeeService.CreateTableAsync(restaurantId, dto, currentUser.Id);
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
            var table = await employeeService.UpdateTableAsync(tableId, dto, currentUser.Id);
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
            await employeeService.DeleteTableAsync(tableId, currentUser.Id);
            return Ok(new { Message = "Table deleted successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPatch("tables/{tableId}/status")]
    public async Task<IActionResult> UpdateTableStatus(string tableId, [FromBody] string newStatus)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            if (!Enum.TryParse<TableStatus>(newStatus, true, out var tableStatus))
                return BadRequest(new { Message = "Invalid status value" });

            var table = await employeeService.UpdateTableStatusAsync(tableId, tableStatus, currentUser.Id);
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
            var count = await employeeService.GetAvailableTablesCountAsync(restaurantId, currentUser.Id);
            return Ok(new { Count = count });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
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
            var orders = await orderService.GetRestaurantOrdersAsync(restaurantId, currentUser.Id, pageNumber, pageSize);
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
        string status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            if (!Enum.TryParse<OrderStatus>(status, true, out var orderStatus))
                return BadRequest(new { Message = "Invalid status value" });

            var orders = await orderService.GetRestaurantOrdersByStatusAsync(restaurantId, currentUser.Id, orderStatus, pageNumber, pageSize);
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
            var order = await orderService.GetOrderByIdAsync(orderId, currentUser.Id);
            return Ok(order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("orders/{orderId}/status")]
    public async Task<IActionResult> UpdateOrderStatus(
        string orderId,
        [FromBody] UpdateOrderStatusDto dto)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            if (!Enum.TryParse<OrderStatus>(dto.Status, true, out var orderStatus))
                return BadRequest(new { Message = "Invalid status value" });

            var order = await orderService.UpdateOrderStatusAsync(orderId, currentUser.Id, orderStatus);
            return Ok(order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/orders/active/count")]
    public async Task<IActionResult> GetActiveOrdersCount(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var count = await orderService.GetActiveOrdersCountAsync(restaurantId, currentUser.Id);
            return Ok(new { Count = count });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("restaurants/{restaurantId}/orders/today")]
    public async Task<IActionResult> GetTodayOrders(string restaurantId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var orders = await orderService.GetTodayOrdersAsync(restaurantId, currentUser.Id);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
    
    #endregion
}
