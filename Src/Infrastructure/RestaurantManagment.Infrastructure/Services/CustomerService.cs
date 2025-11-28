using RestaurantManagment.Application.Common.DTOs.Common;
using RestaurantManagment.Application.Common.DTOs.Restaurant;
using RestaurantManagment.Application.Common.DTOs.Menu;
using RestaurantManagment.Application.Common.DTOs.MenuItem;
using RestaurantManagment.Application.Common.DTOs.Order;
using RestaurantManagment.Application.Common.DTOs.Reservation;
using RestaurantManagment.Application.Common.DTOs.Review;
using RestaurantManagment.Application.Common.DTOs.Owner;
using CustomerDtos = RestaurantManagment.Application.Common.DTOs.Customer;
using RestaurantManagment.Application.Common.Interfaces;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using RestaurantManagment.Domain.Enums;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Infrastructure.Services;

public class CustomerService(IAppDbContext context, IMapper mapper, IEmailService emailService) : ICustomerService
{
    #region Restaurant Operations

    public async Task<PaginatedResult<RestaurantDto>> GetRestaurantsAsync(int pageNumber = 1, int pageSize = 10)
    {
        if (pageNumber < 1)
            throw new ArgumentException("Page number must be greater than 0.", nameof(pageNumber));
        
        if (pageSize < 1 || pageSize > 100)
            throw new ArgumentException("Page size must be between 1 and 100.", nameof(pageSize));

        var query = context.Restaurants
            .Include(r => r.Owner)
            .Where(r => !r.IsDeleted)
            .OrderBy(r => r.Name);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var restaurantDtos = mapper.Map<List<RestaurantDto>>(items);

        return new PaginatedResult<RestaurantDto>
        {
            Items = restaurantDtos,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<RestaurantDto?> GetRestaurantByIdAsync(string restaurantId)
    {
        if (string.IsNullOrEmpty(restaurantId))
            throw new ArgumentException("Restaurant ID cannot be null or empty.", nameof(restaurantId));

        var restaurant = await context.Restaurants
            .Include(r => r.Owner)
            .FirstOrDefaultAsync(r => r.Id == restaurantId && !r.IsDeleted);

        if (restaurant == null)
            return null;

        return mapper.Map<RestaurantDto>(restaurant);
    }

    public async Task<IEnumerable<RestaurantDto>> SearchRestaurantsAsync(string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return new List<RestaurantDto>();

        var restaurants = await context.Restaurants
            .Include(r => r.Owner)
            .Where(r => !r.IsDeleted && 
                       (r.Name.Contains(searchTerm) || 
                        r.Description.Contains(searchTerm) ||
                        r.Address.Contains(searchTerm)))
            .OrderBy(r => r.Name)
            .ToListAsync();

        return mapper.Map<IEnumerable<RestaurantDto>>(restaurants);
    }

    public async Task<IEnumerable<RestaurantDto>> GetRestaurantsByCategoryAsync(RestaurantCategory category)
    {
        var restaurants = await context.Restaurants
            .Include(r => r.Owner)
            .Where(r => !r.IsDeleted && r.Category == category)
            .OrderBy(r => r.Name)
            .ToListAsync();

        return mapper.Map<IEnumerable<RestaurantDto>>(restaurants);
    }

    public async Task<IEnumerable<RestaurantDto>> GetNearbyRestaurantsAsync(double latitude, double longitude, double radiusKm)
    {
        if (latitude < -90 || latitude > 90)
            throw new ArgumentException("Latitude must be between -90 and 90.", nameof(latitude));

        if (longitude < -180 || longitude > 180)
            throw new ArgumentException("Longitude must be between -180 and 180.", nameof(longitude));

        if (radiusKm <= 0)
            throw new ArgumentException("Radius must be greater than 0.", nameof(radiusKm));
        
        var restaurants = await context.Restaurants
            .Include(r => r.Owner)
            .Where(r => !r.IsDeleted && r.Latitude != null && r.Longitude != null)
            .ToListAsync();
        
        var nearbyRestaurants = restaurants
            .Select(r => new
            {
                Restaurant = r,
                Distance = CalculateDistance(latitude, longitude, r.Latitude!.Value, r.Longitude!.Value)
            })
            .Where(x => x.Distance <= radiusKm)
            .OrderBy(x => x.Distance)
            .Select(x => x.Restaurant)
            .ToList();

        return mapper.Map<IEnumerable<RestaurantDto>>(nearbyRestaurants);
    }

    private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double earthRadiusKm = 6371.0;

        var dLat = DegreesToRadians(lat2 - lat1);
        var dLon = DegreesToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return earthRadiusKm * c;
    }

    private static double DegreesToRadians(double degrees)
    {
        return degrees * Math.PI / 180.0;
    }

    public async Task<IEnumerable<RestaurantDto>> GetTopRatedRestaurantsAsync(int count = 10)
    {
        if (count <= 0 || count > 100)
            throw new ArgumentException("Count must be between 1 and 100.", nameof(count));
        
        var restaurantIds = await context.Restaurants
            .Where(r => !r.IsDeleted)
            .Select(r => r.Id)
            .ToListAsync();
        
        var reviewsGrouped = await context.Reviews
            .Where(r => restaurantIds.Contains(r.RestaurantId) && r.Status == "Approved")
            .GroupBy(r => r.RestaurantId)
            .Select(g => new
            {
                RestaurantId = g.Key,
                AverageRating = g.Average(r => (double)r.Rating),
                ReviewCount = g.Count()
            })
            .OrderByDescending(x => x.AverageRating)
            .ThenByDescending(x => x.ReviewCount)
            .Take(count)
            .ToListAsync();
        
        var topRestaurantIds = reviewsGrouped.Select(r => r.RestaurantId).ToList();
        var restaurants = await context.Restaurants
            .Include(r => r.Owner)
            .Where(r => topRestaurantIds.Contains(r.Id))
            .ToListAsync();
        
        var orderedRestaurants = topRestaurantIds
            .Select(id => restaurants.FirstOrDefault(r => r.Id == id))
            .Where(r => r != null)
            .ToList();

        return mapper.Map<IEnumerable<RestaurantDto>>(orderedRestaurants);
    }

    #endregion

    #region Menu & Menu Items Operations

    public async Task<IEnumerable<MenuDto>> GetRestaurantMenusAsync(string restaurantId)
    {
        if (string.IsNullOrEmpty(restaurantId))
            throw new ArgumentException("Restaurant ID cannot be null or empty.", nameof(restaurantId));

        var menus = await context.Menus
            .Include(m => m.Restaurant)
            .Include(m => m.MenuItems)
            .Where(m => m.RestaurantId == restaurantId && !m.IsDeleted)
            .OrderBy(m => m.Name)
            .ToListAsync();

        return mapper.Map<IEnumerable<MenuDto>>(menus);
    }

    public async Task<MenuDto?> GetMenuByIdAsync(string menuId)
    {
        if (string.IsNullOrEmpty(menuId))
            throw new ArgumentException("Menu ID cannot be null or empty.", nameof(menuId));

        var menu = await context.Menus
            .Include(m => m.Restaurant)
            .Include(m => m.MenuItems)
            .FirstOrDefaultAsync(m => m.Id == menuId && !m.IsDeleted);

        if (menu == null)
            return null;

        return mapper.Map<MenuDto>(menu);
    }

    public async Task<PaginatedResult<MenuItemDto>> GetMenuItemsAsync(string menuId, int pageNumber = 1, int pageSize = 20)
    {
        if (string.IsNullOrEmpty(menuId))
            throw new ArgumentException("Menu ID cannot be null or empty.", nameof(menuId));

        if (pageNumber < 1)
            throw new ArgumentException("Page number must be greater than 0.", nameof(pageNumber));

        if (pageSize < 1 || pageSize > 100)
            throw new ArgumentException("Page size must be between 1 and 100.", nameof(pageSize));

        var query = context.MenuItems
            .Include(mi => mi.Menu)
            .Where(mi => mi.MenuId == menuId && !mi.IsDeleted)
            .OrderBy(mi => mi.Category)
            .ThenBy(mi => mi.Name);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var menuItemDtos = mapper.Map<List<MenuItemDto>>(items);

        return new PaginatedResult<MenuItemDto>
        {
            Items = menuItemDtos,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<MenuItemDto?> GetMenuItemByIdAsync(string menuItemId)
    {
        if (string.IsNullOrEmpty(menuItemId))
            throw new ArgumentException("Menu item ID cannot be null or empty.", nameof(menuItemId));

        var menuItem = await context.MenuItems
            .Include(mi => mi.Menu)
            .ThenInclude(m => m.Restaurant)
            .FirstOrDefaultAsync(mi => mi.Id == menuItemId && !mi.IsDeleted);

        if (menuItem == null)
            return null;

        return mapper.Map<MenuItemDto>(menuItem);
    }

    public async Task<IEnumerable<MenuItemDto>> GetAvailableMenuItemsAsync(string restaurantId)
    {
        if (string.IsNullOrEmpty(restaurantId))
            throw new ArgumentException("Restaurant ID cannot be null or empty.", nameof(restaurantId));

        var menuItems = await context.MenuItems
            .Include(mi => mi.Menu)
            .Where(mi => mi.Menu.RestaurantId == restaurantId && 
                        !mi.IsDeleted && 
                        mi.IsAvailable)
            .OrderBy(mi => mi.Category)
            .ThenBy(mi => mi.Name)
            .ToListAsync();

        return mapper.Map<IEnumerable<MenuItemDto>>(menuItems);
    }

    public async Task<IEnumerable<MenuItemDto>> SearchMenuItemsAsync(string restaurantId, string searchTerm)
    {
        if (string.IsNullOrEmpty(restaurantId))
            throw new ArgumentException("Restaurant ID cannot be null or empty.", nameof(restaurantId));

        if (string.IsNullOrWhiteSpace(searchTerm))
            return new List<MenuItemDto>();

        var menuItems = await context.MenuItems
            .Include(mi => mi.Menu)
            .Where(mi => mi.Menu.RestaurantId == restaurantId && 
                        !mi.IsDeleted &&
                        (mi.Name.Contains(searchTerm) || 
                         mi.Description.Contains(searchTerm) ||
                         (mi.Category != null && mi.Category.Contains(searchTerm))))
            .OrderBy(mi => mi.Name)
            .ToListAsync();

        return mapper.Map<IEnumerable<MenuItemDto>>(menuItems);
    }

    #endregion

    #region Order Operations

    public async Task<PaginatedResult<OrderDto>> GetMyOrdersAsync(string customerId, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        if (pageNumber < 1)
            throw new ArgumentException("Page number must be greater than 0.", nameof(pageNumber));

        if (pageSize < 1 || pageSize > 100)
            throw new ArgumentException("Page size must be between 1 and 100.", nameof(pageSize));

        var query = context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Where(o => o.CustomerId == customerId && !o.IsDeleted)
            .OrderByDescending(o => o.OrderDate);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var orderDtos = mapper.Map<List<OrderDto>>(items);

        return new PaginatedResult<OrderDto>
        {
            Items = orderDtos,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<OrderDto?> GetOrderByIdAsync(string orderId, string customerId)
    {
        if (string.IsNullOrEmpty(orderId))
            throw new ArgumentException("Order ID cannot be null or empty.", nameof(orderId));

        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        var order = await context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Include(o => o.Table)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerId == customerId && !o.IsDeleted);

        if (order == null)
            return null;

        return mapper.Map<OrderDto>(order);
    }

    public async Task<OrderDto> CreateOrderAsync(CustomerDtos.CreateOrderDto dto, string customerId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        if (string.IsNullOrEmpty(dto.RestaurantId))
            throw new ArgumentException("Restaurant ID cannot be null or empty.");

        if (dto.Items == null || !dto.Items.Any()) 
            throw new ArgumentException("Order must contain at least one item.");

        foreach (var item in dto.Items)
        {
            if (item.Quantity < 1)
                throw new ArgumentException("Item quantity must be at least 1.");
        }
        
        var restaurant = await context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == dto.RestaurantId && !r.IsDeleted);

        if (restaurant == null)
            throw new InvalidOperationException("Restaurant not found.");
        
   
        var customer = await context.Users.FirstOrDefaultAsync(u => u.Id == customerId);
        if (customer == null)
            throw new InvalidOperationException("Customer not found.");
        
        var order = new Order
        {
            Id = Guid.NewGuid().ToString(),
            CustomerId = customerId,
            RestaurantId = dto.RestaurantId,
            OrderDate = DateTime.UtcNow,
            Type = dto.OrderType,
            DeliveryAddress = dto.DeliveryAddress,
            SpecialRequests = dto.DeliveryInstructions,
            PaymentMethod = dto.PaymentMethod,
            Status = OrderStatus.Pending,
            IsDeleted = false
        };
        
        decimal totalAmount = 0;
        var orderItemsList = new List<(string itemName, int quantity, decimal price)>();
        
        foreach (var itemDto in dto.Items)
        {
            var menuItem = await context.MenuItems
                .FirstOrDefaultAsync(mi => mi.Id == itemDto.MenuItemId && !mi.IsDeleted);

            if (menuItem == null)
                throw new InvalidOperationException($"Menu item {itemDto.MenuItemId} not found.");

            if (!menuItem.IsAvailable)
                throw new InvalidOperationException($"Menu item {menuItem.Name} is not available.");

            var orderItem = new OrderItem
            {
                Id = Guid.NewGuid().ToString(),
                OrderId = order.Id,
                MenuItemId = itemDto.MenuItemId,
                Quantity = itemDto.Quantity,
                UnitPrice = menuItem.Price,
                Notes = itemDto.SpecialInstructions
            };

            orderItem.CalculateSubtotal();
            totalAmount += orderItem.Subtotal;

            order.OrderItems.Add(orderItem);
            orderItemsList.Add((menuItem.Name, itemDto.Quantity, menuItem.Price));
        }

        // Use the total amount from frontend if provided (includes delivery fee and coupon discount)
        order.TotalAmount = dto.TotalAmount > 0 ? dto.TotalAmount : totalAmount;
        
        // If coupon code is provided, mark it as used
        if (!string.IsNullOrEmpty(dto.CouponCode))
        {
            var redemption = await context.RewardRedemptions
                .FirstOrDefaultAsync(r => r.CouponCode == dto.CouponCode && r.CustomerId == customerId && !r.IsUsed);
            
            if (redemption != null)
            {
                redemption.IsUsed = true;
                redemption.UsedAt = DateTime.UtcNow;
            }
        }

        context.Orders.Add(order);
        await context.SaveChangesAsync();
        try
        {
            var pointsToAdd = (int)Math.Floor(order.TotalAmount / 100) * 10;
            
            if (pointsToAdd > 0)
            {
                var loyaltyPoint = new LoyaltyPoint
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = customerId,
                    RestaurantId = dto.RestaurantId,
                    Points = pointsToAdd,
                    Description = $"Sipariş puanı - Sipariş #{order.Id.Substring(0, 8)}",
                    Type = LoyaltyPointType.Earned,
                    EarnedAt = DateTime.UtcNow,
                    ExpiryDate = DateTime.UtcNow.AddYears(1),
                    IsRedeemed = false
                };

                context.LoyaltyPoints.Add(loyaltyPoint);
                await context.SaveChangesAsync();
                
                Console.WriteLine($"Added {pointsToAdd} loyalty points for order {order.Id}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to add loyalty points: {ex.Message}");
        }
        
        try
        {
            await emailService.SendOrderConfirmationEmailAsync(
                to: customer.Email ?? "",
                customerName: customer.FullName ?? customer.UserName ?? "Müşteri",
                orderId: order.Id,
                restaurantName: restaurant.Name,
                totalAmount: order.TotalAmount,
                deliveryAddress: dto.DeliveryAddress ?? "Belirtilmedi",
                items: orderItemsList
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send order confirmation email: {ex.Message}");
        }

        return await GetOrderByIdAsync(order.Id, customerId) 
               ?? throw new InvalidOperationException("Failed to retrieve created order.");
    }

    public async Task<OrderDto> UpdateOrderAsync(string orderId, CustomerDtos.UpdateOrderDto dto, string customerId)
    {
        if (string.IsNullOrEmpty(orderId))
            throw new ArgumentException("Order ID cannot be null or empty.", nameof(orderId));

        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        var order = await context.Orders
            .FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerId == customerId && !o.IsDeleted);

        if (order == null)
            throw new InvalidOperationException("Order not found.");
        
        if (order.Status != OrderStatus.Pending)
            throw new InvalidOperationException("Only pending orders can be updated.");
        
        order.DeliveryAddress = dto.DeliveryAddress;
        order.SpecialRequests = dto.DeliveryInstructions;

        await context.SaveChangesAsync();

        return await GetOrderByIdAsync(orderId, customerId) 
               ?? throw new InvalidOperationException("Failed to retrieve updated order.");
    }

    public async Task CancelOrderAsync(string orderId, string customerId)
    {
        if (string.IsNullOrEmpty(orderId))
            throw new ArgumentException("Order ID cannot be null or empty.", nameof(orderId));

        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        var order = await context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Restaurant)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerId == customerId && !o.IsDeleted);

        if (order == null)
            throw new InvalidOperationException("Order not found.");
        
        if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Confirmed)
            throw new InvalidOperationException("Order cannot be cancelled at this stage.");

        order.Status = OrderStatus.Cancelled;
        order.CompletedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        
        if (order.Customer != null && order.Restaurant != null)
        {
            try
            {
                await emailService.SendOrderCancelledEmailAsync(
                    to: order.Customer.Email ?? "",
                    customerName: order.Customer.FullName ?? order.Customer.UserName ?? "Müşteri",
                    orderId: order.Id,
                    restaurantName: order.Restaurant.Name,
                    reason: "Müşteri tarafından iptal edildi"
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send order cancellation email: {ex.Message}");
            }
        }
    }

    public async Task<IEnumerable<OrderDto>> GetActiveOrdersAsync(string customerId)
    {
        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        var activeStatuses = new[] 
        { 
            OrderStatus.Pending, 
            OrderStatus.Confirmed, 
            OrderStatus.Preparing, 
            OrderStatus.Ready,
            OrderStatus.OutForDelivery,
            OrderStatus.Delivered
        };

        var orders = await context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Include(o => o.DeliveryPerson)
            .Where(o => o.CustomerId == customerId && 
                       !o.IsDeleted && 
                       activeStatuses.Contains(o.Status))
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

        return mapper.Map<IEnumerable<OrderDto>>(orders);
    }

    public async Task<IEnumerable<OrderDto>> GetOrderHistoryAsync(string customerId)
    {
        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        var completedStatuses = new[] 
        { 
            OrderStatus.Delivered, 
            OrderStatus.Completed, 
            OrderStatus.Cancelled 
        };

        var orders = await context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Where(o => o.CustomerId == customerId && 
                       !o.IsDeleted && 
                       completedStatuses.Contains(o.Status))
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

        return mapper.Map<IEnumerable<OrderDto>>(orders);
    }

    public async Task<OrderDto?> GetCurrentOrderAsync(string customerId)
    {
        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        var activeStatuses = new[] 
        { 
            OrderStatus.Pending, 
            OrderStatus.Confirmed, 
            OrderStatus.Preparing 
        };

        var order = await context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Where(o => o.CustomerId == customerId && 
                       !o.IsDeleted && 
                       activeStatuses.Contains(o.Status))
            .OrderByDescending(o => o.OrderDate)
            .FirstOrDefaultAsync();

        if (order == null)
            return null;

        return mapper.Map<OrderDto>(order);
    }

    public async Task<int> GetOrdersCountAsync(string customerId)
    {
        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        return await context.Orders
            .Where(o => o.CustomerId == customerId && !o.IsDeleted)
            .CountAsync();
    }

    #endregion

    #region Reservation Operations

    public async Task<PaginatedResult<ReservationDto>> GetMyReservationsAsync(string customerId, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        if (pageNumber < 1)
            throw new ArgumentException("Page number must be greater than 0.", nameof(pageNumber));

        if (pageSize < 1 || pageSize > 100)
            throw new ArgumentException("Page size must be between 1 and 100.", nameof(pageSize));

        var query = context.Reservations
            .Include(r => r.Restaurant)
            .Include(r => r.Table)
            .Where(r => r.CustomerId == customerId && !r.IsDeleted)
            .OrderByDescending(r => r.ReservationDate);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var reservationDtos = mapper.Map<List<ReservationDto>>(items);

        return new PaginatedResult<ReservationDto>
        {
            Items = reservationDtos,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<ReservationDto?> GetReservationByIdAsync(string reservationId, string customerId)
    {
        if (string.IsNullOrEmpty(reservationId))
            throw new ArgumentException("Reservation ID cannot be null or empty.", nameof(reservationId));

        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        var reservation = await context.Reservations
            .Include(r => r.Restaurant)
            .Include(r => r.Table)
            .FirstOrDefaultAsync(r => r.Id == reservationId && r.CustomerId == customerId && !r.IsDeleted);

        if (reservation == null)
            return null;

        return mapper.Map<ReservationDto>(reservation);
    }

    public async Task<ReservationDto> CreateReservationAsync(CustomerDtos.CreateReservationDto dto, string customerId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        if (string.IsNullOrEmpty(dto.RestaurantId))
            throw new ArgumentException("Restaurant ID cannot be null or empty.");

        if (dto.ReservationDate <= DateTime.UtcNow)
            throw new ArgumentException("Reservation date must be in the future.");

        if (dto.PartySize < 1)
            throw new ArgumentException("Party size must be at least 1.");

        var restaurant = await context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == dto.RestaurantId && !r.IsDeleted);

        if (restaurant == null)
            throw new InvalidOperationException("Restaurant not found.");
        
        var customer = await context.Users.FirstOrDefaultAsync(u => u.Id == customerId);
        if (customer == null)
            throw new InvalidOperationException("Customer not found.");
        
        string? tableId = dto.TableId;
        if (string.IsNullOrEmpty(tableId))
        {
            var availableTables = await GetAvailableTablesAsync(dto.RestaurantId, dto.ReservationDate, dto.PartySize);
            var firstAvailableTable = availableTables.FirstOrDefault();
            
            if (firstAvailableTable == null)
                throw new InvalidOperationException("No available tables for the specified date and party size.");
            
            tableId = firstAvailableTable.Id;
        }
        else
        {
            var isAvailable = await CheckTableAvailabilityAsync(tableId, dto.ReservationDate);
            if (!isAvailable)
                throw new InvalidOperationException("Selected table is not available for the specified date.");
        }
        
        var table = await context.Tables.FirstOrDefaultAsync(t => t.Id == tableId);

        var reservation = new Reservation
        {
            Id = Guid.NewGuid().ToString(),
            CustomerId = customerId,
            RestaurantId = dto.RestaurantId,
            TableId = tableId,
            ReservationDate = dto.ReservationDate,
            NumberOfGuests = dto.PartySize,
            SpecialRequests = dto.SpecialRequests,
            CustomerName = customer.UserName ?? customer.Email ?? "Guest",
            CustomerPhone = customer.PhoneNumber ?? "",
            CustomerEmail = customer.Email,
            Status = ReservationStatus.Pending,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow
        };

        context.Reservations.Add(reservation);
        await context.SaveChangesAsync();
        
        try
        {
            var tableInfo = table != null ? $"Masa {table.TableNumber}" : "Atanacak";
            await emailService.SendReservationConfirmationEmailAsync(
                to: customer.Email ?? "",
                customerName: customer.FullName ?? customer.UserName ?? "Müşteri",
                reservationId: reservation.Id,
                restaurantName: restaurant.Name,
                reservationDate: dto.ReservationDate,
                numberOfGuests: dto.PartySize,
                tableInfo: tableInfo
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send reservation confirmation email: {ex.Message}");
        }

        return await GetReservationByIdAsync(reservation.Id, customerId) 
               ?? throw new InvalidOperationException("Failed to retrieve created reservation.");
    }

    public async Task<ReservationDto> UpdateReservationAsync(string reservationId, CustomerDtos.UpdateReservationDto dto, string customerId)
    {
        if (string.IsNullOrEmpty(reservationId))
            throw new ArgumentException("Reservation ID cannot be null or empty.", nameof(reservationId));

        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        var reservation = await context.Reservations
            .FirstOrDefaultAsync(r => r.Id == reservationId && r.CustomerId == customerId && !r.IsDeleted);

        if (reservation == null)
            throw new InvalidOperationException("Reservation not found.");

        if (reservation.Status == ReservationStatus.Cancelled || reservation.Status == ReservationStatus.Completed)
            throw new InvalidOperationException("Cannot update cancelled or completed reservations.");

        if (dto.ReservationDate <= DateTime.UtcNow)
            throw new ArgumentException("Reservation date must be in the future.");

        if (dto.PartySize < 1)
            throw new ArgumentException("Party size must be at least 1.");
        
        if (dto.ReservationDate != reservation.ReservationDate || dto.PartySize != reservation.NumberOfGuests)
        {
            var isAvailable = await CheckTableAvailabilityAsync(reservation.TableId, dto.ReservationDate);
            if (!isAvailable)
            {
                var availableTables = await GetAvailableTablesAsync(reservation.RestaurantId, dto.ReservationDate, dto.PartySize);
                var firstAvailableTable = availableTables.FirstOrDefault();
                
                if (firstAvailableTable == null)
                    throw new InvalidOperationException("No available tables for the updated date and party size.");
                
                reservation.TableId = firstAvailableTable.Id;
            }
        }

        reservation.ReservationDate = dto.ReservationDate;
        reservation.NumberOfGuests = dto.PartySize;
        reservation.SpecialRequests = dto.SpecialRequests;
        reservation.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return await GetReservationByIdAsync(reservationId, customerId) 
               ?? throw new InvalidOperationException("Failed to retrieve updated reservation.");
    }

    public async Task CancelReservationAsync(string reservationId, string customerId)
    {
        if (string.IsNullOrEmpty(reservationId))
            throw new ArgumentException("Reservation ID cannot be null or empty.", nameof(reservationId));

        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        var reservation = await context.Reservations
            .Include(r => r.Customer)
            .Include(r => r.Restaurant)
            .FirstOrDefaultAsync(r => r.Id == reservationId && r.CustomerId == customerId && !r.IsDeleted);

        if (reservation == null)
            throw new InvalidOperationException("Reservation not found.");

        if (reservation.Status == ReservationStatus.Cancelled)
            throw new InvalidOperationException("Reservation is already cancelled.");

        if (reservation.Status == ReservationStatus.Completed)
            throw new InvalidOperationException("Cannot cancel completed reservation.");

        reservation.Status = ReservationStatus.Cancelled;
        reservation.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        
        if (reservation.Customer != null && reservation.Restaurant != null)
        {
            try
            {
                await emailService.SendReservationCancelledEmailAsync(
                    to: reservation.Customer.Email ?? "",
                    customerName: reservation.Customer.FullName ?? reservation.Customer.UserName ?? "Müşteri",
                    reservationId: reservation.Id,
                    restaurantName: reservation.Restaurant.Name,
                    reservationDate: reservation.ReservationDate,
                    reason: "Müşteri tarafından iptal edildi"
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send reservation cancellation email: {ex.Message}");
            }
        }
    }

    public async Task<IEnumerable<ReservationDto>> GetUpcomingReservationsAsync(string customerId)
    {
        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        var now = DateTime.UtcNow;
        var activeStatuses = new[] 
        { 
            ReservationStatus.Pending, 
            ReservationStatus.Confirmed 
        };

        var reservations = await context.Reservations
            .Include(r => r.Restaurant)
            .Include(r => r.Table)
            .Where(r => r.CustomerId == customerId && 
                       !r.IsDeleted && 
                       activeStatuses.Contains(r.Status) &&
                       r.ReservationDate >= now)
            .OrderBy(r => r.ReservationDate)
            .ToListAsync();

        return mapper.Map<IEnumerable<ReservationDto>>(reservations);
    }

    public async Task<IEnumerable<ReservationDto>> GetPastReservationsAsync(string customerId)
    {
        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        var now = DateTime.UtcNow;
        var completedStatuses = new[] 
        { 
            ReservationStatus.Completed, 
            ReservationStatus.Cancelled 
        };

        var reservations = await context.Reservations
            .Include(r => r.Restaurant)
            .Include(r => r.Table)
            .Where(r => r.CustomerId == customerId && 
                       !r.IsDeleted && 
                       (completedStatuses.Contains(r.Status) || r.ReservationDate < now))
            .OrderByDescending(r => r.ReservationDate)
            .ToListAsync();

        return mapper.Map<IEnumerable<ReservationDto>>(reservations);
    }

    public async Task<IEnumerable<TableDto>> GetAvailableTablesAsync(string restaurantId, DateTime date, int partySize)
    {
        if (string.IsNullOrEmpty(restaurantId))
            throw new ArgumentException("Restaurant ID cannot be null or empty.", nameof(restaurantId));

        if (date <= DateTime.UtcNow)
            throw new ArgumentException("Date must be in the future.", nameof(date));

        if (partySize < 1)
            throw new ArgumentException("Party size must be at least 1.", nameof(partySize));
        
        var tables = await context.Tables
            .Where(t => t.RestaurantId == restaurantId && 
                       !t.IsDeleted && 
                       t.Status == TableStatus.Available &&
                       t.Capacity >= partySize)
            .ToListAsync();
        
        var reservationStartWindow = date.AddHours(-2);
        var reservationEndWindow = date.AddHours(2);

        var reservedTableIds = await context.Reservations
            .Where(r => r.RestaurantId == restaurantId &&
                       !r.IsDeleted &&
                       (r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.Confirmed) &&
                       r.ReservationDate >= reservationStartWindow &&
                       r.ReservationDate <= reservationEndWindow)
            .Select(r => r.TableId)
            .Distinct()
            .ToListAsync();

        var availableTables = tables
            .Where(t => !reservedTableIds.Contains(t.Id))
            .OrderBy(t => t.Capacity)
            .ToList();

        return mapper.Map<IEnumerable<TableDto>>(availableTables);
    }

    public async Task<bool> CheckTableAvailabilityAsync(string tableId, DateTime date)
    {
        if (string.IsNullOrEmpty(tableId))
            throw new ArgumentException("Table ID cannot be null or empty.", nameof(tableId));

        if (date <= DateTime.UtcNow)
            return false;

        var table = await context.Tables
            .FirstOrDefaultAsync(t => t.Id == tableId && !t.IsDeleted);

        if (table == null || table.Status != TableStatus.Available)
            return false;
        
        var reservationStartWindow = date.AddHours(-2);
        var reservationEndWindow = date.AddHours(2);

        var hasConflictingReservation = await context.Reservations
            .AnyAsync(r => r.TableId == tableId &&
                          !r.IsDeleted &&
                          (r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.Confirmed) &&
                          r.ReservationDate >= reservationStartWindow &&
                          r.ReservationDate <= reservationEndWindow);

        return !hasConflictingReservation;
    }

    #endregion

    #region Review Operations

    public async Task<PaginatedResult<ReviewDto>> GetRestaurantReviewsAsync(string restaurantId, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(restaurantId))
            throw new ArgumentException("Restaurant ID cannot be null or empty.", nameof(restaurantId));

        if (pageNumber < 1)
            throw new ArgumentException("Page number must be greater than 0.", nameof(pageNumber));

        if (pageSize < 1 || pageSize > 100)
            throw new ArgumentException("Page size must be between 1 and 100.", nameof(pageSize));

        var query = context.Reviews
            .Include(r => r.Customer)
            .Include(r => r.Restaurant)
            .Where(r => r.RestaurantId == restaurantId && !r.IsDeleted && r.Status == "Approved")
            .OrderByDescending(r => r.CreatedAt);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var reviewDtos = mapper.Map<List<ReviewDto>>(items);

        return new PaginatedResult<ReviewDto>
        {
            Items = reviewDtos,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<PaginatedResult<ReviewDto>> GetMyReviewsAsync(string customerId, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        if (pageNumber < 1)
            throw new ArgumentException("Page number must be greater than 0.", nameof(pageNumber));

        if (pageSize < 1 || pageSize > 100)
            throw new ArgumentException("Page size must be between 1 and 100.", nameof(pageSize));

        var query = context.Reviews
            .Include(r => r.Customer)
            .Include(r => r.Restaurant)
            .Where(r => r.CustomerId == customerId && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAt);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        
        var reviewDtos = new List<ReviewDto>();
        foreach (var review in items)
        {
            reviewDtos.Add(new ReviewDto
            {
                Id = review.Id,
                RestaurantId = review.RestaurantId,
                RestaurantName = review.Restaurant?.Name ?? "Unknown Restaurant",
                CustomerId = review.CustomerId,
                CustomerName = review.Customer?.FullName ?? "Unknown Customer",
                CustomerEmail = review.Customer?.Email,
                Rating = review.Rating,
                Comment = review.Comment,
                Status = review.Status,
                OwnerResponse = review.OwnerResponse,
                CreatedAt = review.CreatedAt,
                RespondedAt = review.RespondedAt,
                IsReported = review.IsReported,
                ReportReason = review.ReportReason,
                ReportedAt = review.ReportedAt,
                AdminNote = review.AdminNote
            });
        }

        return new PaginatedResult<ReviewDto>
        {
            Items = reviewDtos,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<ReviewDto?> GetReviewByIdAsync(string reviewId, string customerId)
    {
        if (string.IsNullOrEmpty(reviewId))
            throw new ArgumentException("Review ID cannot be null or empty.", nameof(reviewId));

        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        var review = await context.Reviews
            .Include(r => r.Customer)
            .Include(r => r.Restaurant)
            .FirstOrDefaultAsync(r => r.Id == reviewId && r.CustomerId == customerId && !r.IsDeleted);

        if (review == null)
            return null;

        return mapper.Map<ReviewDto>(review);
    }

    public async Task<ReviewDto> CreateReviewAsync(CustomerDtos.CreateReviewDto dto, string customerId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        if (string.IsNullOrEmpty(dto.RestaurantId))
            throw new ArgumentException("Restaurant ID cannot be null or empty.");

        if (dto.Rating < 1 || dto.Rating > 5)
            throw new ArgumentException("Rating must be between 1 and 5.");

        if (string.IsNullOrWhiteSpace(dto.Comment))
            throw new ArgumentException("Comment cannot be empty.");
        
        var restaurant = await context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == dto.RestaurantId && !r.IsDeleted);

        if (restaurant == null)
            throw new InvalidOperationException("Restaurant not found.");
        
        var canReview = await CanReviewRestaurantAsync(dto.RestaurantId, customerId);
        if (!canReview)
            throw new InvalidOperationException("You can only review restaurants where you have completed orders or reservations.");
        
        var existingReview = await context.Reviews
            .FirstOrDefaultAsync(r => r.RestaurantId == dto.RestaurantId && 
                                     r.CustomerId == customerId && 
                                     !r.IsDeleted);

        if (existingReview != null)
            throw new InvalidOperationException("You have already reviewed this restaurant. Please update your existing review instead.");

        var review = new Review
        {
            Id = Guid.NewGuid().ToString(),
            CustomerId = customerId,
            RestaurantId = dto.RestaurantId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            Status = "Pending",
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow
        };

        context.Reviews.Add(review);
        await context.SaveChangesAsync();

        return await GetReviewByIdAsync(review.Id, customerId) 
               ?? throw new InvalidOperationException("Failed to retrieve created review.");
    }

    public async Task<ReviewDto> UpdateReviewAsync(string reviewId, CustomerDtos.UpdateReviewDto dto, string customerId)
    {
        if (string.IsNullOrEmpty(reviewId))
            throw new ArgumentException("Review ID cannot be null or empty.", nameof(reviewId));

        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (dto.Rating < 1 || dto.Rating > 5)
            throw new ArgumentException("Rating must be between 1 and 5.");

        if (string.IsNullOrWhiteSpace(dto.Comment))
            throw new ArgumentException("Comment cannot be empty.");

        var review = await context.Reviews
            .FirstOrDefaultAsync(r => r.Id == reviewId && r.CustomerId == customerId && !r.IsDeleted);

        if (review == null)
            throw new InvalidOperationException("Review not found.");

        review.Rating = dto.Rating;
        review.Comment = dto.Comment;
        review.Status = "Pending";
        review.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return await GetReviewByIdAsync(reviewId, customerId) 
               ?? throw new InvalidOperationException("Failed to retrieve updated review.");
    }

    public async Task DeleteReviewAsync(string reviewId, string customerId)
    {
        if (string.IsNullOrEmpty(reviewId))
            throw new ArgumentException("Review ID cannot be null or empty.", nameof(reviewId));

        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        var review = await context.Reviews
            .FirstOrDefaultAsync(r => r.Id == reviewId && r.CustomerId == customerId && !r.IsDeleted);

        if (review == null)
            throw new InvalidOperationException("Review not found.");

        review.IsDeleted = true;
        review.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
    }

    public async Task<bool> CanReviewRestaurantAsync(string restaurantId, string customerId)
    {
        if (string.IsNullOrEmpty(restaurantId))
            throw new ArgumentException("Restaurant ID cannot be null or empty.", nameof(restaurantId));

        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));
        
        var hasCompletedOrder = await context.Orders
            .AnyAsync(o => o.RestaurantId == restaurantId && 
                          o.CustomerId == customerId && 
                          !o.IsDeleted && 
                          (o.Status == OrderStatus.Completed || o.Status == OrderStatus.Delivered));

        if (hasCompletedOrder)
            return true;
        
        var hasCompletedReservation = await context.Reservations
            .AnyAsync(r => r.RestaurantId == restaurantId && 
                          r.CustomerId == customerId && 
                          !r.IsDeleted && 
                          r.Status == ReservationStatus.Completed);

        return hasCompletedReservation;
    }

    public async Task<ReviewDto?> GetMyReviewForRestaurantAsync(string restaurantId, string customerId)
    {
        if (string.IsNullOrEmpty(restaurantId))
            throw new ArgumentException("Restaurant ID cannot be null or empty.", nameof(restaurantId));

        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        var review = await context.Reviews
            .Include(r => r.Customer)
            .Include(r => r.Restaurant)
            .FirstOrDefaultAsync(r => r.RestaurantId == restaurantId && 
                                     r.CustomerId == customerId && 
                                     !r.IsDeleted);

        if (review == null)
            return null;

        return mapper.Map<ReviewDto>(review);
    }

    public async Task<double> GetRestaurantAverageRatingAsync(string restaurantId)
    {
        if (string.IsNullOrEmpty(restaurantId))
            throw new ArgumentException("Restaurant ID cannot be null or empty.", nameof(restaurantId));

        var reviews = await context.Reviews
            .Where(r => r.RestaurantId == restaurantId && 
                       !r.IsDeleted && 
                       r.Status == "Approved")
            .ToListAsync();

        if (!reviews.Any())
            return 0;

        return reviews.Average(r => (double)r.Rating);
    }

    #endregion

    #region Favorite Restaurants

    public async Task<IEnumerable<RestaurantDto>> GetFavoriteRestaurantsAsync(string customerId)
    {
        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        var favoriteRestaurants = await context.FavoriteRestaurants
            .Include(f => f.Restaurant)
                .ThenInclude(r => r.Owner)
            .Where(f => f.CustomerId == customerId && !f.IsDeleted)
            .OrderByDescending(f => f.AddedAt)
            .Select(f => f.Restaurant)
            .ToListAsync();

        return mapper.Map<IEnumerable<RestaurantDto>>(favoriteRestaurants);
    }

    public async Task AddToFavoritesAsync(string restaurantId, string customerId)
    {
        if (string.IsNullOrEmpty(restaurantId))
            throw new ArgumentException("Restaurant ID cannot be null or empty.", nameof(restaurantId));

        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        var restaurant = await context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == restaurantId && !r.IsDeleted);

        if (restaurant == null)
            throw new InvalidOperationException("Restaurant not found.");
        
        var existingFavorite = await context.FavoriteRestaurants
            .FirstOrDefaultAsync(f => f.CustomerId == customerId && 
                                     f.RestaurantId == restaurantId && 
                                     !f.IsDeleted);

        if (existingFavorite != null)
            throw new InvalidOperationException("Restaurant is already in favorites.");

        var favorite = new FavoriteRestaurant
        {
            Id = Guid.NewGuid().ToString(),
            CustomerId = customerId,
            RestaurantId = restaurantId,
            AddedAt = DateTime.UtcNow,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow
        };

        context.FavoriteRestaurants.Add(favorite);
        await context.SaveChangesAsync();
    }

    public async Task RemoveFromFavoritesAsync(string restaurantId, string customerId)
    {
        if (string.IsNullOrEmpty(restaurantId))
            throw new ArgumentException("Restaurant ID cannot be null or empty.", nameof(restaurantId));

        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        var favorite = await context.FavoriteRestaurants
            .FirstOrDefaultAsync(f => f.CustomerId == customerId && 
                                     f.RestaurantId == restaurantId && 
                                     !f.IsDeleted);

        if (favorite == null)
            throw new InvalidOperationException("Restaurant is not in favorites.");

        favorite.IsDeleted = true;
        favorite.UpdatedAt = DateTime.UtcNow;
        
        await context.SaveChangesAsync();
    }

    public async Task<bool> IsFavoriteRestaurantAsync(string restaurantId, string customerId)
    {
        if (string.IsNullOrEmpty(restaurantId))
            throw new ArgumentException("Restaurant ID cannot be null or empty.", nameof(restaurantId));

        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        return await context.FavoriteRestaurants
            .AnyAsync(f => f.CustomerId == customerId && 
                          f.RestaurantId == restaurantId && 
                          !f.IsDeleted);
    }

    #endregion

    #region Customer Profile & Stats

    public async Task<CustomerDtos.CustomerStatisticsDto> GetCustomerStatisticsAsync(string customerId)
    {
        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        var totalOrders = await GetTotalOrdersCountAsync(customerId);
        var totalReservations = await GetTotalReservationsCountAsync(customerId);
        var totalSpent = await GetTotalSpentAsync(customerId);

        var totalReviews = await context.Reviews
            .Where(r => r.CustomerId == customerId && !r.IsDeleted)
            .CountAsync();

        var favoriteRestaurants = await GetFavoriteRestaurantsAsync(customerId);
        var favoriteRestaurantsCount = favoriteRestaurants.Count();

        var averageRatingGiven = 0.0;
        var reviews = await context.Reviews
            .Where(r => r.CustomerId == customerId && !r.IsDeleted)
            .ToListAsync();

        if (reviews.Any())
        {
            averageRatingGiven = reviews.Average(r => (double)r.Rating);
        }
        
        var favoriteRestaurantId = await context.Orders
            .Where(o => o.CustomerId == customerId && !o.IsDeleted)
            .GroupBy(o => o.RestaurantId)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .FirstOrDefaultAsync();

        string? favoriteRestaurantName = null;
        if (favoriteRestaurantId != null)
        {
            var restaurant = await context.Restaurants
                .FirstOrDefaultAsync(r => r.Id == favoriteRestaurantId);
            favoriteRestaurantName = restaurant?.Name;
        }
        
        var favoriteCuisine = await context.Orders
            .Include(o => o.Restaurant)
            .Where(o => o.CustomerId == customerId && !o.IsDeleted)
            .GroupBy(o => o.Restaurant.Category)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .FirstOrDefaultAsync();

        return new CustomerDtos.CustomerStatisticsDto
        {
            TotalOrders = totalOrders,
            TotalReservations = totalReservations,
            TotalReviews = totalReviews,
            TotalSpent = totalSpent,
            FavoriteRestaurantsCount = favoriteRestaurantsCount,
            AverageRatingGiven = averageRatingGiven,
            FavoriteRestaurantName = favoriteRestaurantName,
            FavoriteCuisine = favoriteCuisine
        };
    }

    public async Task<IEnumerable<RestaurantDto>> GetRecommendedRestaurantsAsync(string customerId, int count = 10)
    {
        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        if (count <= 0 || count > 100)
            throw new ArgumentException("Count must be between 1 and 100.", nameof(count));
        
        var favoriteCategories = await context.Orders
            .Include(o => o.Restaurant)
            .Where(o => o.CustomerId == customerId && !o.IsDeleted)
            .Select(o => o.Restaurant.Category)
            .Where(c => c != null)
            .GroupBy(c => c)
            .OrderByDescending(g => g.Count())
            .Take(3)
            .Select(g => g.Key)
            .ToListAsync();
        
        var orderedRestaurantIds = await context.Orders
            .Where(o => o.CustomerId == customerId && !o.IsDeleted)
            .Select(o => o.RestaurantId)
            .Distinct()
            .ToListAsync();

        IQueryable<Restaurant> query;
        
        if (favoriteCategories.Any())
        {
            query = context.Restaurants
                .Where(r => !r.IsDeleted && 
                           !orderedRestaurantIds.Contains(r.Id) &&
                           r.Category != null &&
                           favoriteCategories.Contains(r.Category));
        }
        else
        {
            query = context.Restaurants
                .Where(r => !r.IsDeleted && !orderedRestaurantIds.Contains(r.Id));
        }

        var restaurants = await query
            .Include(r => r.Owner)
            .OrderByDescending(r => r.Rate)
            .Take(count)
            .ToListAsync();

        return mapper.Map<IEnumerable<RestaurantDto>>(restaurants);
    }

    public async Task<decimal> GetTotalSpentAsync(string customerId)
    {
        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        var total = await context.Orders
            .Where(o => o.CustomerId == customerId && 
                       !o.IsDeleted && 
                       o.Status != OrderStatus.Cancelled)
            .SumAsync(o => o.TotalAmount);

        return total;
    }

    public async Task<int> GetTotalOrdersCountAsync(string customerId)
    {
        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        return await context.Orders
            .Where(o => o.CustomerId == customerId && !o.IsDeleted)
            .CountAsync();
    }

    public async Task<int> GetTotalReservationsCountAsync(string customerId)
    {
        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        return await context.Reservations
            .Where(r => r.CustomerId == customerId && !r.IsDeleted)
            .CountAsync();
    }

    #endregion

    #region Loyalty & Rewards

    public async Task<int> GetLoyaltyPointsAsync(string customerId, string restaurantId)
    {
        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        if (string.IsNullOrEmpty(restaurantId))
            throw new ArgumentException("Restaurant ID cannot be null or empty.", nameof(restaurantId));
        
        var totalPoints = await context.LoyaltyPoints
            .Where(lp => lp.CustomerId == customerId && 
                        lp.RestaurantId == restaurantId && 
                        !lp.IsDeleted &&
                        !lp.IsRedeemed &&
                        (lp.ExpiryDate == null || lp.ExpiryDate > DateTime.UtcNow))
            .SumAsync(lp => lp.Points);

        return totalPoints;
    }

    public async Task<IEnumerable<CustomerDtos.RewardDto>> GetAvailableRewardsAsync(string customerId, string restaurantId)
    {
        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));

        if (string.IsNullOrEmpty(restaurantId))
            throw new ArgumentException("Restaurant ID cannot be null or empty.", nameof(restaurantId));
        
        var loyaltyPoints = await GetLoyaltyPointsAsync(customerId, restaurantId);
        
        var now = DateTime.UtcNow;
        var rewards = await context.Rewards
            .Where(r => r.RestaurantId == restaurantId && 
                       !r.IsDeleted && 
                       r.IsActive &&
                       r.PointsRequired <= loyaltyPoints &&
                       (r.StartDate == null || r.StartDate <= now) &&
                       (r.EndDate == null || r.EndDate >= now) &&
                       (r.MaxRedemptions == null || r.CurrentRedemptions < r.MaxRedemptions))
            .OrderBy(r => r.PointsRequired)
            .ToListAsync();

        return mapper.Map<IEnumerable<CustomerDtos.RewardDto>>(rewards);
    }

    public async Task RedeemRewardAsync(string rewardId, string customerId)
    {
        if (string.IsNullOrEmpty(rewardId))
            throw new ArgumentException("Reward ID cannot be null or empty.", nameof(rewardId));

        if (string.IsNullOrEmpty(customerId))
            throw new ArgumentException("Customer ID cannot be null or empty.", nameof(customerId));
        
        var reward = await context.Rewards
            .FirstOrDefaultAsync(r => r.Id == rewardId && !r.IsDeleted && r.IsActive);

        if (reward == null)
            throw new InvalidOperationException("Reward not found or not available.");
        
        var now = DateTime.UtcNow;
        if (reward.StartDate.HasValue && reward.StartDate > now)
            throw new InvalidOperationException("Reward is not yet available.");

        if (reward.EndDate.HasValue && reward.EndDate < now)
            throw new InvalidOperationException("Reward has expired.");
        
        if (reward.MaxRedemptions.HasValue && reward.CurrentRedemptions >= reward.MaxRedemptions)
            throw new InvalidOperationException("Reward redemption limit reached.");
        
        var customerPoints = await GetLoyaltyPointsAsync(customerId, reward.RestaurantId);
        if (customerPoints < reward.PointsRequired)
            throw new InvalidOperationException($"Insufficient points. You have {customerPoints} points but need {reward.PointsRequired} points.");
        
        var redemptionPoint = new LoyaltyPoint
        {
            Id = Guid.NewGuid().ToString(),
            CustomerId = customerId,
            RestaurantId = reward.RestaurantId,
            Points = -reward.PointsRequired,
            Description = $"Redeemed reward: {reward.Name}",
            Type = LoyaltyPointType.Redeemed,
            EarnedAt = DateTime.UtcNow,
            IsRedeemed = true,
            RedeemedAt = DateTime.UtcNow,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow
        };

        context.LoyaltyPoints.Add(redemptionPoint);
        
        var couponCode = GenerateCouponCode();
        var redemption = new RewardRedemption
        {
            Id = Guid.NewGuid().ToString(),
            CustomerId = customerId,
            RewardId = rewardId,
            PointsSpent = reward.PointsRequired,
            RedeemedAt = DateTime.UtcNow,
            CouponCode = couponCode,
            IsUsed = false,
            ExpiryDate = DateTime.UtcNow.AddMonths(3),
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow
        };

        context.RewardRedemptions.Add(redemption);
        
        reward.CurrentRedemptions++;

        await context.SaveChangesAsync();
    }

    private string GenerateCouponCode()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 8)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    #endregion
}
