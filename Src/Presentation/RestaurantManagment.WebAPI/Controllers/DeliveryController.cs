using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RestaurantManagment.Application.Common.Interfaces;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Delivery")]
public class DeliveryController(
    IOrderService orderService,
    UserManager<AppUser> userManager) : ControllerBase
{
    [HttpGet("available-orders")]
    public async Task<IActionResult> GetAvailableOrders(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var orders = await orderService.GetReadyOrdersForDeliveryAsync(pageNumber, pageSize);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var orders = await orderService.GetDeliveryPersonOrdersAsync(currentUser.Id, pageNumber, pageSize);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("accept-order/{orderId}")]
    public async Task<IActionResult> AcceptOrder(string orderId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var order = await orderService.AcceptOrderForDeliveryAsync(orderId, currentUser.Id);
            return Ok(order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("update-order-status/{orderId}")]
    public async Task<IActionResult> UpdateOrderStatus(string orderId, [FromBody] OrderStatus newStatus)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var order = await orderService.UpdateDeliveryOrderStatusAsync(orderId, currentUser.Id, newStatus);
            return Ok(order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("order/{orderId}")]
    public async Task<IActionResult> GetOrderDetails(string orderId)
    {
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized(new { Message = "User not found" });

        try
        {
            var order = await orderService.GetDeliveryOrderDetailsAsync(orderId, currentUser.Id);
            return Ok(order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}

