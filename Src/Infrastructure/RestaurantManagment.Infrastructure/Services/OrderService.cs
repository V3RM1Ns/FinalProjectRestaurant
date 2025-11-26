using RestaurantManagment.Application.Common.DTOs.Order;
using RestaurantManagment.Application.Common.Interfaces;
using RestaurantManagment.Application.Common.Models;
using RestaurantManagment.Domain.Models;
using RestaurantManagment.Application.DTOs.Order;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace RestaurantManagment.Infrastructure.Services;

public class OrderService(IAppDbContext context, IMapper mapper, IEmailService emailService) : IOrderService
{
    #region Helper Methods

    private async Task<bool> IsEmployeeOfRestaurantAsync(string restaurantId, string employeeId)
    {
        return await context.Users
            .AnyAsync(u => u.Id == employeeId && u.EmployerRestaurantId == restaurantId && !u.IsDeleted);
    }

    private async Task<bool> IsOwnerOfRestaurantAsync(string restaurantId, string ownerId)
    {
        return await context.Restaurants
            .AnyAsync(r => r.Id == restaurantId && r.OwnerId == ownerId && !r.IsDeleted);
    }

    private async Task ValidateRestaurantAccessAsync(string restaurantId, string userId)
    {
        var isEmployee = await IsEmployeeOfRestaurantAsync(restaurantId, userId);
        var isOwner = await IsOwnerOfRestaurantAsync(restaurantId, userId);
        
        if (!isEmployee && !isOwner)
            throw new UnauthorizedAccessException("You don't have access to this restaurant's orders.");
    }

    private async Task<Order> GetOrderWithDetailsAsync(string orderId)
    {
        var order = await context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.Customer)
            .Include(o => o.Table)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .FirstOrDefaultAsync(o => o.Id == orderId && !o.IsDeleted);

        if (order == null)
            throw new KeyNotFoundException($"Order with ID {orderId} not found.");

        return order;
    }

    #endregion

    #region Employee/Owner Methods

    public async Task<PaginatedList<OrderResponseDto>> GetRestaurantOrdersAsync(
        string restaurantId, 
        string userId, 
        int pageNumber = 1, 
        int pageSize = 10)
    {
        await ValidateRestaurantAccessAsync(restaurantId, userId);

        var query = context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Table)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Where(o => o.RestaurantId == restaurantId && !o.IsDeleted)
            .OrderByDescending(o => o.OrderDate);

        var totalCount = await query.CountAsync();
        var orders = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var orderDtos = mapper.Map<List<OrderResponseDto>>(orders);

        return new PaginatedList<OrderResponseDto>(
            orderDtos,
            totalCount,
            pageNumber,
            pageSize
        );
    }

    public async Task<PaginatedList<OrderResponseDto>> GetRestaurantOrdersByStatusAsync(
        string restaurantId, 
        string userId, 
        OrderStatus status, 
        int pageNumber = 1, 
        int pageSize = 10)
    {
        await ValidateRestaurantAccessAsync(restaurantId, userId);

        var query = context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Table)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Where(o => o.RestaurantId == restaurantId && o.Status == status && !o.IsDeleted)
            .OrderByDescending(o => o.OrderDate);

        var totalCount = await query.CountAsync();
        var orders = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var orderDtos = mapper.Map<List<OrderResponseDto>>(orders);

        return new PaginatedList<OrderResponseDto>(
            orderDtos,
            totalCount,
            pageNumber,
            pageSize
        );
    }

    public async Task<OrderResponseDto> GetOrderByIdAsync(string orderId, string userId)
    {
        var order = await GetOrderWithDetailsAsync(orderId);
        
        await ValidateRestaurantAccessAsync(order.RestaurantId, userId);

        return mapper.Map<OrderResponseDto>(order);
    }

    public async Task<OrderResponseDto> UpdateOrderStatusAsync(string orderId, string userId, OrderStatus newStatus)
    {
        var order = await GetOrderWithDetailsAsync(orderId);
        
        await ValidateRestaurantAccessAsync(order.RestaurantId, userId);

        order.Status = newStatus;
        order.UpdatedAt = DateTime.UtcNow;

        if (newStatus == OrderStatus.Completed)
        {
            order.CompletedAt = DateTime.UtcNow;
        }

        await context.SaveChangesAsync(CancellationToken.None);
        
        try
        {
            if (order.Customer?.Email != null)
            {
                var customerName = order.Customer.UserName ?? "Müşteri";
                var restaurantName = order.Restaurant.Name;
 
                string? estimatedDeliveryTime = null;
                if (newStatus == OrderStatus.Preparing)
                {
                    estimatedDeliveryTime = "30-45 dakika";
                }
                else if (newStatus == OrderStatus.OutForDelivery)
                {
                    estimatedDeliveryTime = "15-20 dakika";
                }

                await emailService.SendOrderStatusUpdateEmailAsync(
                    order.Customer.Email,
                    customerName,
                    orderId,
                    restaurantName,
                    newStatus.ToString(),
                    estimatedDeliveryTime
                );
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Email notification failed for order {orderId}: {ex.Message}");
        }

        return mapper.Map<OrderResponseDto>(order);
    }

    public async Task<int> GetActiveOrdersCountAsync(string restaurantId, string userId)
    {
        await ValidateRestaurantAccessAsync(restaurantId, userId);

        return await context.Orders
            .CountAsync(o => o.RestaurantId == restaurantId 
                && o.Status != OrderStatus.Completed 
                && o.Status != OrderStatus.Cancelled 
                && !o.IsDeleted);
    }

    public async Task<List<OrderResponseDto>> GetTodayOrdersAsync(string restaurantId, string userId)
    {
        await ValidateRestaurantAccessAsync(restaurantId, userId);

        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var orders = await context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Table)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Where(o => o.RestaurantId == restaurantId 
                && o.OrderDate >= today 
                && o.OrderDate < tomorrow 
                && !o.IsDeleted)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

        return mapper.Map<List<OrderResponseDto>>(orders);
    }

    #endregion

    #region Customer Methods

    public async Task<OrderResponseDto> CreateOrderAsync(CreateOrderDto createOrderDto, string customerId)
    {
        var restaurant = await context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == createOrderDto.RestaurantId && !r.IsDeleted);

        if (restaurant == null)
            throw new KeyNotFoundException("Restaurant not found.");

        var customer = await context.Users.FindAsync(customerId);
        
        var order = new Order
        {
            CustomerId = customerId,
            RestaurantId = createOrderDto.RestaurantId,
            TableId = createOrderDto.TableId,
            OrderDate = DateTime.UtcNow,
            TotalAmount = 0,
            Status = OrderStatus.Pending,
            Type = OrderType.DineIn,
            SpecialRequests = createOrderDto.SpecialRequests,
            DeliveryAddress = createOrderDto.DeliveryAddress,
            PaymentMethod = createOrderDto.PaymentMethod
        };

        context.Orders.Add(order);
        await context.SaveChangesAsync(CancellationToken.None);

        var orderItemsList = new List<(string itemName, int quantity, decimal price)>();
        if (createOrderDto.OrderItems != null && createOrderDto.OrderItems.Any())
        {
            decimal total = 0;
            foreach (var itemDto in createOrderDto.OrderItems)
            {
                var menuItem = await context.MenuItems.FindAsync(itemDto.MenuItemId);
                if (menuItem != null)
                {
                    var orderItem = new OrderItem
                    {
                        OrderId = order.Id,
                        MenuItemId = itemDto.MenuItemId,
                        Quantity = itemDto.Quantity,
                        UnitPrice = menuItem.Price,
                        Subtotal = menuItem.Price * itemDto.Quantity,
                        Notes = itemDto.Notes
                    };
                    context.OrderItems.Add(orderItem);
                    total += orderItem.Subtotal;
                    orderItemsList.Add((menuItem.Name, itemDto.Quantity, menuItem.Price));
                }
            }
            order.TotalAmount = total;
            await context.SaveChangesAsync(CancellationToken.None);
        }

        try
        {
            if (customer?.Email != null)
            {
                await emailService.SendOrderConfirmationEmailAsync(
                    customer.Email,
                    customer.UserName ?? "Müşteri",
                    order.Id,
                    restaurant.Name,
                    order.TotalAmount,
                    order.DeliveryAddress ?? "Restoranda teslim",
                    orderItemsList
                );
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Email notification failed for new order {order.Id}: {ex.Message}");
        }

        return await GetOrderByIdForCustomerAsync(order.Id, customerId);
    }

    public async Task<PaginatedList<OrderResponseDto>> GetCustomerOrdersAsync(
        string customerId, 
        int pageNumber = 1, 
        int pageSize = 10)
    {
        var query = context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.Table)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Where(o => o.CustomerId == customerId && !o.IsDeleted)
            .OrderByDescending(o => o.OrderDate);

        var totalCount = await query.CountAsync();
        var orders = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var orderDtos = mapper.Map<List<OrderResponseDto>>(orders);

        return new PaginatedList<OrderResponseDto>(
            orderDtos,
            totalCount,
            pageNumber,
            pageSize
        );
    }

    public async Task<OrderResponseDto> CancelOrderAsync(string orderId, string customerId)
    {
        var order = await context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.Customer)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerId == customerId && !o.IsDeleted);

        if (order == null)
            throw new KeyNotFoundException("Order not found.");

        if (order.Status == OrderStatus.Completed || order.Status == OrderStatus.Cancelled)
            throw new InvalidOperationException("Cannot cancel this order.");

        order.Status = OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(CancellationToken.None);

        try
        {
            if (order.Customer?.Email != null)
            {
                var customerName = order.Customer.UserName ?? "Müşteri";
                var restaurantName = order.Restaurant?.Name ?? "Restoran";

                await emailService.SendOrderCancelledEmailAsync(
                    order.Customer.Email,
                    customerName,
                    orderId,
                    restaurantName,
                    "Müşteri tarafından iptal edildi"
                );
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Email notification failed for cancelled order {orderId}: {ex.Message}");
        }

        return mapper.Map<OrderResponseDto>(order);
    }

    private async Task<OrderResponseDto> GetOrderByIdForCustomerAsync(string orderId, string customerId)
    {
        var order = await context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.Table)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerId == customerId && !o.IsDeleted);

        if (order == null)
            throw new KeyNotFoundException("Order not found.");

        return mapper.Map<OrderResponseDto>(order);
    }

    #endregion

    #region Delivery Methods

    public async Task<PaginatedList<OrderResponseDto>> GetReadyOrdersForDeliveryAsync(int pageNumber = 1, int pageSize = 10)
    {
        var query = context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.Customer)
            .Include(o => o.Table)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Where(o => o.Status == OrderStatus.Ready 
                && o.Type == OrderType.Delivery 
                && o.DeliveryPersonId == null 
                && !o.IsDeleted)
            .OrderBy(o => o.OrderDate);

        var totalCount = await query.CountAsync();
        var orders = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var orderDtos = mapper.Map<List<OrderResponseDto>>(orders);

        return new PaginatedList<OrderResponseDto>(
            orderDtos,
            totalCount,
            pageNumber,
            pageSize
        );
    }

    public async Task<PaginatedList<OrderResponseDto>> GetDeliveryPersonOrdersAsync(string deliveryPersonId, int pageNumber = 1, int pageSize = 10)
    {
        var query = context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.Customer)
            .Include(o => o.Table)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Where(o => o.DeliveryPersonId == deliveryPersonId && !o.IsDeleted)
            .OrderByDescending(o => o.OrderDate);

        var totalCount = await query.CountAsync();
        var orders = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var orderDtos = mapper.Map<List<OrderResponseDto>>(orders);

        return new PaginatedList<OrderResponseDto>(
            orderDtos,
            totalCount,
            pageNumber,
            pageSize
        );
    }

    public async Task<OrderResponseDto> AcceptOrderForDeliveryAsync(string orderId, string deliveryPersonId)
    {
        var order = await GetOrderWithDetailsAsync(orderId);

        if (order.Status != OrderStatus.Ready)
            throw new InvalidOperationException("Only Ready orders can be accepted for delivery.");

        if (order.DeliveryPersonId != null)
            throw new InvalidOperationException("This order is already assigned to a delivery person.");

        var hasActiveDelivery = await context.Orders
            .AnyAsync(o => o.DeliveryPersonId == deliveryPersonId 
                && (o.Status == OrderStatus.OutForDelivery || o.Status == OrderStatus.Ready) 
                && !o.IsDeleted);

        if (hasActiveDelivery)
            throw new InvalidOperationException("You already have an active delivery. Please complete it first.");

        order.DeliveryPersonId = deliveryPersonId;
        order.Status = OrderStatus.OutForDelivery;
        order.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(CancellationToken.None);

        try
        {
            if (order.Customer?.Email != null)
            {
                await emailService.SendOrderStatusUpdateEmailAsync(
                    order.Customer.Email,
                    order.Customer.UserName ?? "Müşteri",
                    orderId,
                    order.Restaurant.Name,
                    OrderStatus.OutForDelivery.ToString(),
                    "15-20 dakika"
                );
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Email notification failed for order {orderId}: {ex.Message}");
        }

        return mapper.Map<OrderResponseDto>(order);
    }

    public async Task<OrderResponseDto> UpdateDeliveryOrderStatusAsync(string orderId, string deliveryPersonId, OrderStatus newStatus)
    {
        var order = await GetOrderWithDetailsAsync(orderId);

        if (order.DeliveryPersonId != deliveryPersonId)
            throw new UnauthorizedAccessException("You are not assigned to this order.");

        if (newStatus != OrderStatus.Delivered && newStatus != OrderStatus.Completed)
            throw new InvalidOperationException("Invalid status update. You can only mark order as Delivered or Completed.");

        order.Status = newStatus;
        order.UpdatedAt = DateTime.UtcNow;

        if (newStatus == OrderStatus.Completed || newStatus == OrderStatus.Delivered)
        {
            order.CompletedAt = DateTime.UtcNow;
        }

        await context.SaveChangesAsync(CancellationToken.None);

        try
        {
            if (order.Customer?.Email != null)
            {
                await emailService.SendOrderStatusUpdateEmailAsync(
                    order.Customer.Email,
                    order.Customer.UserName ?? "Müşteri",
                    orderId,
                    order.Restaurant.Name,
                    newStatus.ToString(),
                    null
                );
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Email notification failed for order {orderId}: {ex.Message}");
        }

        return mapper.Map<OrderResponseDto>(order);
    }

    public async Task<OrderResponseDto> GetDeliveryOrderDetailsAsync(string orderId, string deliveryPersonId)
    {
        var order = await GetOrderWithDetailsAsync(orderId);

        if (order.DeliveryPersonId != deliveryPersonId)
            throw new UnauthorizedAccessException("You are not assigned to this order.");

        return mapper.Map<OrderResponseDto>(order);
    }

    #endregion
}
