using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantManagment.Domain.Models;
using RestaurantManagment.Persistance.Data;
using System.Security.Claims;

namespace RestaurantManagment.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;

    public ChatController(AppDbContext context)
    {
        _context = context;
    }

    private string GetUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? throw new UnauthorizedAccessException("User not authenticated");
    }

    [HttpGet("order/{orderId}/messages")]
    public async Task<ActionResult<List<ChatMessageDto>>> GetChatHistory(string orderId)
    {
        var userId = GetUserId();

        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
            return NotFound("Order not found");

        if (order.CustomerId != userId && order.DeliveryPersonId != userId)
            return Forbid();

        var messages = await _context.ChatMessages
            .Where(m => m.OrderId == orderId)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new ChatMessageDto
            {
                Id = m.Id,
                OrderId = m.OrderId,
                SenderId = m.SenderId,
                SenderName = m.SenderName,
                SenderRole = m.SenderRole,
                Content = m.Content,
                IsRead = m.IsRead,
                Timestamp = m.CreatedAt.ToString("o")
            })
            .ToListAsync();

        return Ok(messages);
    }

    [HttpPost("messages/{messageId}/read")]
    public async Task<IActionResult> MarkAsRead(string messageId)
    {
        var userId = GetUserId();

        var message = await _context.ChatMessages
            .Include(m => m.Order)
            .FirstOrDefaultAsync(m => m.Id == messageId);

        if (message == null)
            return NotFound("Message not found");

        if (message.Order.CustomerId != userId && message.Order.DeliveryPersonId != userId)
            return Forbid();

        if (message.SenderId == userId)
            return Ok();

        message.IsRead = true;
        message.ReadAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("order/{orderId}/mark-all-read")]
    public async Task<IActionResult> MarkAllAsRead(string orderId)
    {
        var userId = GetUserId();

        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
            return NotFound("Order not found");

        if (order.CustomerId != userId && order.DeliveryPersonId != userId)
            return Forbid();

        var messages = await _context.ChatMessages
            .Where(m => m.OrderId == orderId && m.SenderId != userId && !m.IsRead)
            .ToListAsync();

        foreach (var message in messages)
        {
            message.IsRead = true;
            message.ReadAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new { markedCount = messages.Count });
    }

    [HttpGet("order/{orderId}/unread-count")]
    public async Task<ActionResult<UnreadCountDto>> GetUnreadCount(string orderId)
    {
        var userId = GetUserId();

        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
            return NotFound("Order not found");

        if (order.CustomerId != userId && order.DeliveryPersonId != userId)
            return Forbid();

        var count = await _context.ChatMessages
            .Where(m => m.OrderId == orderId && m.SenderId != userId && !m.IsRead)
            .CountAsync();

        return Ok(new UnreadCountDto { Count = count });
    }
}

public class ChatMessageDto
{
    public string Id { get; set; } = null!;
    public string OrderId { get; set; } = null!;
    public string SenderId { get; set; } = null!;
    public string SenderName { get; set; } = null!;
    public string SenderRole { get; set; } = null!;
    public string Content { get; set; } = null!;
    public bool IsRead { get; set; }
    public string Timestamp { get; set; } = null!;
}

public class UnreadCountDto
{
    public int Count { get; set; }
}
