using RestaurantManagment.Application.Common.DTOs.Common;
using RestaurantManagment.Application.Common.DTOs.Menu;
using RestaurantManagment.Application.Common.DTOs.MenuItem;
using RestaurantManagment.Application.Common.DTOs.Reservation;
using RestaurantManagment.Application.Common.DTOs.Restaurant;
using RestaurantManagment.Application.Common.DTOs.Owner;
using RestaurantManagment.Application.Common.Interfaces;
using RestaurantManagment.Domain.Models;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace RestaurantManagment.Infrastructure.Services;

public class EmployeeService(IAppDbContext context, IMapper mapper) : IEmployeeService
{
    #region Helper Methods

    private async Task<bool> IsEmployeeOfRestaurantAsync(string restaurantId, string employeeId)
    {
        return await context.Users
            .AnyAsync(u => u.Id == employeeId && u.EmployerRestaurantId == restaurantId && !u.IsDeleted);
    }

    private async Task ValidateEmployeeAccessAsync(string restaurantId, string employeeId)
    {
        var isEmployee = await IsEmployeeOfRestaurantAsync(restaurantId, employeeId);
        if (!isEmployee)
            throw new UnauthorizedAccessException("You don't have access to this restaurant.");
    }

    #endregion

    #region Reservation Management

    public async Task<PaginatedResult<ReservationDto>> GetRestaurantReservationsAsync(string restaurantId, string employeeId, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        await ValidateEmployeeAccessAsync(restaurantId, employeeId);

        var query = context.Reservations
            .Include(r => r.Restaurant)
            .Include(r => r.Table)
            .Where(r => r.RestaurantId == restaurantId && !r.IsDeleted)
            .OrderByDescending(r => r.ReservationDate);

        var totalCount = await query.CountAsync();
        var reservations = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var reservationDtos = mapper.Map<List<ReservationDto>>(reservations);

        return new PaginatedResult<ReservationDto>
        {
            Items = reservationDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<PaginatedResult<ReservationDto>> GetReservationsByStatusAsync(string restaurantId, ReservationStatus status, string employeeId, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        await ValidateEmployeeAccessAsync(restaurantId, employeeId);

        var query = context.Reservations
            .Include(r => r.Restaurant)
            .Include(r => r.Table)
            .Where(r => r.RestaurantId == restaurantId && r.Status == status && !r.IsDeleted)
            .OrderByDescending(r => r.ReservationDate);

        var totalCount = await query.CountAsync();
        var reservations = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var reservationDtos = mapper.Map<List<ReservationDto>>(reservations);

        return new PaginatedResult<ReservationDto>
        {
            Items = reservationDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<ReservationDto?> GetReservationByIdAsync(string reservationId, string employeeId)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        var reservation = await context.Reservations
            .Include(r => r.Restaurant)
            .Include(r => r.Table)
            .FirstOrDefaultAsync(r => r.Id == reservationId && !r.IsDeleted);

        if (reservation == null)
            return null;

        await ValidateEmployeeAccessAsync(reservation.RestaurantId, employeeId);

        return mapper.Map<ReservationDto>(reservation);
    }

    public async Task<ReservationDto> UpdateReservationStatusAsync(string reservationId, ReservationStatus newStatus, string employeeId)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        var reservation = await context.Reservations
            .Include(r => r.Restaurant)
            .Include(r => r.Table)
            .FirstOrDefaultAsync(r => r.Id == reservationId && !r.IsDeleted);

        if (reservation == null)
            throw new Exception("Reservation not found.");

        await ValidateEmployeeAccessAsync(reservation.RestaurantId, employeeId);

        reservation.Status = newStatus;
        reservation.UpdatedAt = DateTime.UtcNow;
        reservation.UpdatedBy = employeeId;

        await context.SaveChangesAsync();

        return mapper.Map<ReservationDto>(reservation);
    }

    public async Task<int> GetActiveReservationsCountAsync(string restaurantId, string employeeId)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        await ValidateEmployeeAccessAsync(restaurantId, employeeId);

        return await context.Reservations
            .Where(r => r.RestaurantId == restaurantId 
                && (r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.Confirmed)
                && !r.IsDeleted)
            .CountAsync();
    }

    public async Task<IEnumerable<ReservationDto>> GetTodayReservationsAsync(string restaurantId, string employeeId)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        await ValidateEmployeeAccessAsync(restaurantId, employeeId);

        var reservations = await context.Reservations
            .Include(r => r.Restaurant)
            .Include(r => r.Table)
            .Where(r => r.RestaurantId == restaurantId 
                && r.ReservationDate >= DateTime.UtcNow.Date 
                && r.ReservationDate < DateTime.UtcNow.Date.AddDays(1)
                && !r.IsDeleted)
            .OrderBy(r => r.ReservationDate)
            .ToListAsync();

        return mapper.Map<List<ReservationDto>>(reservations);
    }

    #endregion

    #region Menu Management

    public async Task<IEnumerable<MenuDto>> GetRestaurantMenusAsync(string restaurantId, string employeeId)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        await ValidateEmployeeAccessAsync(restaurantId, employeeId);

        var menus = await context.Menus
            .Where(m => m.RestaurantId == restaurantId && !m.IsDeleted)
            .Include(m => m.MenuItems)
            .ToListAsync();

        return mapper.Map<List<MenuDto>>(menus);
    }

    public async Task<MenuDto?> GetMenuByIdAsync(string menuId, string employeeId)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        var menu = await context.Menus
            .Where(m => m.Id == menuId && !m.IsDeleted)
            .Include(m => m.MenuItems)
            .FirstOrDefaultAsync();

        if (menu == null)
            return null;

        await ValidateEmployeeAccessAsync(menu.RestaurantId, employeeId);

        return mapper.Map<MenuDto>(menu);
    }

    public async Task<MenuDto> CreateMenuAsync(string restaurantId, CreateMenuDto dto, string employeeId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        var restaurant = await context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == restaurantId && !r.IsDeleted);

        if (restaurant == null)
            throw new Exception("Restaurant not found.");

        await ValidateEmployeeAccessAsync(restaurantId, employeeId);

        var menu = mapper.Map<Menu>(dto);
        menu.RestaurantId = restaurantId;
        menu.CreatedAt = DateTime.UtcNow;
        menu.CreatedBy = employeeId;
        menu.IsDeleted = false;

        context.Menus.Add(menu);
        await context.SaveChangesAsync();

        return mapper.Map<MenuDto>(menu);
    }

    public async Task<MenuDto> UpdateMenuAsync(string menuId, UpdateMenuDto dto, string employeeId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        var menu = await context.Menus
            .FirstOrDefaultAsync(m => m.Id == menuId && !m.IsDeleted);

        if (menu == null)
            throw new Exception("Menu not found.");

        await ValidateEmployeeAccessAsync(menu.RestaurantId, employeeId);

        mapper.Map(dto, menu);
        menu.UpdatedAt = DateTime.UtcNow;
        menu.UpdatedBy = employeeId;

        await context.SaveChangesAsync();

        return mapper.Map<MenuDto>(menu);
    }

    public async Task DeleteMenuAsync(string menuId, string employeeId)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        var menu = await context.Menus
            .FirstOrDefaultAsync(m => m.Id == menuId && !m.IsDeleted);

        if (menu == null)
            throw new Exception("Menu not found.");

        await ValidateEmployeeAccessAsync(menu.RestaurantId, employeeId);

        menu.IsDeleted = true;
        menu.DeletedAt = DateTime.UtcNow;
        menu.DeletedBy = employeeId;

        await context.SaveChangesAsync();
    }

    #endregion

    #region Menu Item Management

    public async Task<PaginatedResult<MenuItemDto>> GetMenuItemsAsync(string menuId, string employeeId, int pageNumber = 1, int pageSize = 20)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        var menu = await context.Menus
            .Include(m => m.Restaurant)
            .FirstOrDefaultAsync(m => m.Id == menuId && !m.IsDeleted);

        if (menu == null)
            throw new Exception("Menu not found.");

        await ValidateEmployeeAccessAsync(menu.RestaurantId, employeeId);

        var query = context.MenuItems
            .Include(mi => mi.Menu)
            .Where(mi => mi.MenuId == menuId && !mi.IsDeleted)
            .OrderBy(mi => mi.Category)
            .ThenBy(mi => mi.Name);

        var totalCount = await query.CountAsync();
        var menuItems = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var menuItemDtos = mapper.Map<List<MenuItemDto>>(menuItems);

        return new PaginatedResult<MenuItemDto>
        {
            Items = menuItemDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<MenuItemDto?> GetMenuItemByIdAsync(string menuItemId, string employeeId)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        var menuItem = await context.MenuItems
            .Include(mi => mi.Menu)
                .ThenInclude(m => m.Restaurant)
            .FirstOrDefaultAsync(mi => mi.Id == menuItemId && !mi.IsDeleted);

        if (menuItem == null)
            return null;

        await ValidateEmployeeAccessAsync(menuItem.Menu.RestaurantId, employeeId);

        return mapper.Map<MenuItemDto>(menuItem);
    }

    public async Task<MenuItemDto> CreateMenuItemAsync(string menuId, CreateMenuItemDto dto, string employeeId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        var menu = await context.Menus
            .Include(m => m.Restaurant)
            .FirstOrDefaultAsync(m => m.Id == menuId && !m.IsDeleted);

        if (menu == null)
            throw new Exception("Menu not found.");

        await ValidateEmployeeAccessAsync(menu.RestaurantId, employeeId);

        var menuItem = mapper.Map<MenuItem>(dto);
        menuItem.MenuId = menuId;
        menuItem.CreatedAt = DateTime.UtcNow;
        menuItem.CreatedBy = employeeId;
        menuItem.IsDeleted = false;

        context.MenuItems.Add(menuItem);
        await context.SaveChangesAsync();
        
        menuItem = await context.MenuItems
            .Include(mi => mi.Menu)
            .FirstAsync(mi => mi.Id == menuItem.Id);

        return mapper.Map<MenuItemDto>(menuItem);
    }

    public async Task<MenuItemDto> UpdateMenuItemAsync(string menuItemId, UpdateMenuItemDto dto, string employeeId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        var menuItem = await context.MenuItems
            .Include(mi => mi.Menu)
                .ThenInclude(m => m.Restaurant)
            .FirstOrDefaultAsync(mi => mi.Id == menuItemId && !mi.IsDeleted);

        if (menuItem == null)
            throw new Exception("Menu item not found.");

        await ValidateEmployeeAccessAsync(menuItem.Menu.RestaurantId, employeeId);

        mapper.Map(dto, menuItem);
        menuItem.UpdatedAt = DateTime.UtcNow;
        menuItem.UpdatedBy = employeeId;

        await context.SaveChangesAsync();

        return mapper.Map<MenuItemDto>(menuItem);
    }

    public async Task DeleteMenuItemAsync(string menuItemId, string employeeId)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        var menuItem = await context.MenuItems
            .Include(mi => mi.Menu)
                .ThenInclude(m => m.Restaurant)
            .FirstOrDefaultAsync(mi => mi.Id == menuItemId && !mi.IsDeleted);

        if (menuItem == null)
            throw new Exception("Menu item not found.");

        await ValidateEmployeeAccessAsync(menuItem.Menu.RestaurantId, employeeId);

        menuItem.IsDeleted = true;
        menuItem.DeletedAt = DateTime.UtcNow;
        menuItem.DeletedBy = employeeId;

        await context.SaveChangesAsync();
    }

    public async Task UpdateMenuItemAvailabilityAsync(string menuItemId, bool isAvailable, string employeeId)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        var menuItem = await context.MenuItems
            .Include(mi => mi.Menu)
                .ThenInclude(m => m.Restaurant)
            .FirstOrDefaultAsync(mi => mi.Id == menuItemId && !mi.IsDeleted);

        if (menuItem == null)
            throw new Exception("Menu item not found.");

        await ValidateEmployeeAccessAsync(menuItem.Menu.RestaurantId, employeeId);

        menuItem.IsAvailable = isAvailable;
        menuItem.UpdatedAt = DateTime.UtcNow;
        menuItem.UpdatedBy = employeeId;

        await context.SaveChangesAsync();
    }

    public async Task<int> GetMenuItemsCountAsync(string restaurantId, string employeeId)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        await ValidateEmployeeAccessAsync(restaurantId, employeeId);

        return await context.MenuItems
            .Include(mi => mi.Menu)
            .Where(mi => mi.Menu.RestaurantId == restaurantId && !mi.IsDeleted)
            .CountAsync();
    }

    #endregion

    #region Table Management

    public async Task<IEnumerable<TableDto>> GetRestaurantTablesAsync(string restaurantId, string employeeId)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        await ValidateEmployeeAccessAsync(restaurantId, employeeId);

        var tables = await context.Tables
            .Where(t => t.RestaurantId == restaurantId && !t.IsDeleted)
            .OrderBy(t => t.TableNumber)
            .ToListAsync();

        return mapper.Map<List<TableDto>>(tables);
    }

    public async Task<TableDto?> GetTableByIdAsync(string tableId, string employeeId)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        var table = await context.Tables
            .FirstOrDefaultAsync(t => t.Id == tableId && !t.IsDeleted);

        if (table == null)
            return null;

        await ValidateEmployeeAccessAsync(table.RestaurantId, employeeId);

        return mapper.Map<TableDto>(table);
    }

    public async Task<TableDto> CreateTableAsync(string restaurantId, CreateTableDto dto, string employeeId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        await ValidateEmployeeAccessAsync(restaurantId, employeeId);

        var existingTable = await context.Tables
            .FirstOrDefaultAsync(t => t.RestaurantId == restaurantId 
                && t.TableNumber == dto.TableNumber 
                && !t.IsDeleted);

        if (existingTable != null)
            throw new Exception($"Table number {dto.TableNumber} already exists in this restaurant.");

        var table = mapper.Map<Table>(dto);
        table.RestaurantId = restaurantId;
        table.CreatedAt = DateTime.UtcNow;
        table.CreatedBy = employeeId;
        table.IsDeleted = false;
        
        if (Enum.TryParse<TableStatus>(dto.Status, true, out var status))
            table.Status = status;
        else
            table.Status = TableStatus.Available;

        context.Tables.Add(table);
        await context.SaveChangesAsync();

        return mapper.Map<TableDto>(table);
    }

    public async Task<TableDto> UpdateTableAsync(string tableId, UpdateTableDto dto, string employeeId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        var table = await context.Tables
            .FirstOrDefaultAsync(t => t.Id == tableId && !t.IsDeleted);

        if (table == null)
            throw new Exception("Table not found.");

        await ValidateEmployeeAccessAsync(table.RestaurantId, employeeId);

        if (table.TableNumber != dto.TableNumber)
        {
            var existingTable = await context.Tables
                .FirstOrDefaultAsync(t => t.RestaurantId == table.RestaurantId 
                    && t.TableNumber == dto.TableNumber 
                    && t.Id != tableId
                    && !t.IsDeleted);

            if (existingTable != null)
                throw new Exception($"Table number {dto.TableNumber} already exists in this restaurant.");
        }

        table.TableNumber = dto.TableNumber;
        table.Capacity = dto.Capacity;
        table.Location = dto.Location;
        
        if (Enum.TryParse<TableStatus>(dto.Status, true, out var status))
            table.Status = status;

        table.UpdatedAt = DateTime.UtcNow;
        table.UpdatedBy = employeeId;

        await context.SaveChangesAsync();

        return mapper.Map<TableDto>(table);
    }

    public async Task DeleteTableAsync(string tableId, string employeeId)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        var table = await context.Tables
            .FirstOrDefaultAsync(t => t.Id == tableId && !t.IsDeleted);

        if (table == null)
            throw new Exception("Table not found.");

        await ValidateEmployeeAccessAsync(table.RestaurantId, employeeId);

        table.IsDeleted = true;
        table.DeletedAt = DateTime.UtcNow;
        table.DeletedBy = employeeId;

        await context.SaveChangesAsync();
    }

    public async Task<TableDto> UpdateTableStatusAsync(string tableId, TableStatus newStatus, string employeeId)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        var table = await context.Tables
            .FirstOrDefaultAsync(t => t.Id == tableId && !t.IsDeleted);

        if (table == null)
            throw new Exception("Table not found.");

        await ValidateEmployeeAccessAsync(table.RestaurantId, employeeId);

        table.Status = newStatus;
        table.UpdatedAt = DateTime.UtcNow;
        table.UpdatedBy = employeeId;

        await context.SaveChangesAsync();

        return mapper.Map<TableDto>(table);
    }

    public async Task<int> GetAvailableTablesCountAsync(string restaurantId, string employeeId)
    {
        if (string.IsNullOrEmpty(employeeId))
            throw new ArgumentException("Employee ID cannot be null or empty.", nameof(employeeId));

        await ValidateEmployeeAccessAsync(restaurantId, employeeId);

        return await context.Tables
            .Where(t => t.RestaurantId == restaurantId 
                && t.Status == TableStatus.Available 
                && !t.IsDeleted)
            .CountAsync();
    }

    #endregion
}
