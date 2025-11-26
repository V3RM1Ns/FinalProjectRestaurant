using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using RestaurantManagment.Domain.Models;
using RestaurantManagment.Persistance.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace RestaurantManagment.WebAPI.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly AppDbContext _context;

    public ChatHub(AppDbContext context)
    {
        _context = context;
    }

    private string GetUserId()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            throw new HubException("User not authenticated");
        }
        return userId;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        Console.WriteLine($"✅ User {userId} connected to ChatHub (ConnectionId: {Context.ConnectionId})");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserId();
        Console.WriteLine($"❌ User {userId} disconnected from ChatHub (ConnectionId: {Context.ConnectionId})");
        
        if (exception != null)
        {
            Console.WriteLine($"⚠️ Disconnect error: {exception.Message}");
        }
        
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Kullanıcıyı belirli bir sipariş chat odasına ekler
    /// </summary>
    public async Task JoinOrderChat(string orderId)
    {
        var userId = GetUserId();

        // Sipariş kontrolü
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
        {
            throw new HubException("Order not found");
        }

        // Kullanıcının bu siparişe erişim yetkisi var mı?
        if (order.CustomerId != userId && order.DeliveryPersonId != userId)
        {
            throw new HubException("Unauthorized access to order chat");
        }

        // Kullanıcıyı odaya ekle
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Order_{orderId}");
        
        Console.WriteLine($"👥 User {userId} joined order chat: {orderId}");
        
        // Diğer kullanıcılara bildir
        await Clients.OthersInGroup($"Order_{orderId}").SendAsync("UserJoined", new
        {
            UserId = userId,
            OrderId = orderId,
            Timestamp = DateTime.UtcNow.ToString("o")
        });
    }

    /// <summary>
    /// Kullanıcıyı belirli bir sipariş chat odasından çıkarır
    /// </summary>
    public async Task LeaveOrderChat(string orderId)
    {
        var userId = GetUserId();
        
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Order_{orderId}");
        
        Console.WriteLine($"👋 User {userId} left order chat: {orderId}");
        
        // Diğer kullanıcılara bildir
        await Clients.OthersInGroup($"Order_{orderId}").SendAsync("UserLeft", new
        {
            UserId = userId,
            OrderId = orderId,
            Timestamp = DateTime.UtcNow.ToString("o")
        });
    }

    /// <summary>
    /// Sipariş chatine mesaj gönderir (Customer ve Delivery arasında)
    /// </summary>
    public async Task SendMessage(string orderId, string content)
    {
        var userId = GetUserId();

        if (string.IsNullOrWhiteSpace(content))
        {
            throw new HubException("Message content cannot be empty");
        }

        // Kullanıcı bilgilerini al
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            throw new HubException("User not found");
        }

        // Sipariş kontrolü
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
        {
            throw new HubException("Order not found");
        }

        // Yetki kontrolü - Sadece müşteri ve kurye mesajlaşabilir
        if (order.CustomerId != userId && order.DeliveryPersonId != userId)
        {
            throw new HubException("Unauthorized access to order chat");
        }

        // Kullanıcının rolünü belirle
        string senderRole = order.CustomerId == userId ? "Customer" : "Delivery";

        // Mesajı veritabanına kaydet
        var message = new ChatMessage
        {
            Id = Guid.NewGuid().ToString(),
            OrderId = orderId,
            SenderId = userId,
            SenderName = user.FullName,
            SenderRole = senderRole,
            Content = content.Trim(),
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync();

        Console.WriteLine($"💬 Message sent in order {orderId} by {user.FullName} ({senderRole}): {content.Substring(0, Math.Min(50, content.Length))}...");

        // Mesajı odadaki tüm kullanıcılara gönder
        await Clients.Group($"Order_{orderId}").SendAsync("ReceiveMessage", new
        {
            message.Id,
            message.OrderId,
            message.SenderId,
            message.SenderName,
            message.SenderRole,
            message.Content,
            message.IsRead,
            Timestamp = message.CreatedAt.ToString("o")
        });
    }

    /// <summary>
    /// Kullanıcının yazıyor durumunu iletir
    /// </summary>
    public async Task SendTypingIndicator(string orderId, bool isTyping)
    {
        var userId = GetUserId();

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            throw new HubException("User not found");
        }

        // Sadece diğer kullanıcılara gönder (kendisine değil)
        await Clients.OthersInGroup($"Order_{orderId}").SendAsync("UserTyping", new
        {
            UserId = userId,
            UserName = user.FullName,
            OrderId = orderId,
            IsTyping = isTyping,
            Timestamp = DateTime.UtcNow.ToString("o")
        });
    }

    /// <summary>
    /// Mesajın okunduğunu bildirir
    /// </summary>
    public async Task MarkMessageAsRead(string messageId)
    {
        var userId = GetUserId();

        var message = await _context.ChatMessages
            .Include(m => m.Order)
            .FirstOrDefaultAsync(m => m.Id == messageId);

        if (message == null)
        {
            throw new HubException("Message not found");
        }

        // Kendi mesajını okuma olarak işaretleyemez
        if (message.SenderId == userId)
        {
            return;
        }

        // Yetki kontrolü
        if (message.Order.CustomerId != userId && message.Order.DeliveryPersonId != userId)
        {
            throw new HubException("Unauthorized access");
        }

        if (!message.IsRead)
        {
            message.IsRead = true;
            message.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Gönderene bildir
            await Clients.Group($"Order_{message.OrderId}").SendAsync("MessageRead", new
            {
                MessageId = messageId,
                ReadBy = userId,
                ReadAt = message.ReadAt?.ToString("o")
            });
        }
    }
}
