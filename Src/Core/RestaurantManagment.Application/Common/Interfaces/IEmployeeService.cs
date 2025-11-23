using RestaurantManagment.Application.Common.DTOs.Common;
using RestaurantManagment.Application.Common.DTOs.Reservation;
using RestaurantManagment.Application.Common.DTOs.Menu;
using RestaurantManagment.Application.Common.DTOs.Owner;
using MenuItemDto = RestaurantManagment.Application.Common.DTOs.MenuItem.MenuItemDto;
using CreateMenuItemDto = RestaurantManagment.Application.Common.DTOs.MenuItem.CreateMenuItemDto;
using UpdateMenuItemDto = RestaurantManagment.Application.Common.DTOs.MenuItem.UpdateMenuItemDto;
using RestaurantManagment.Domain.Models;
using CreateMenuDto = RestaurantManagment.Application.Common.DTOs.Menu.CreateMenuDto;
using UpdateMenuDto = RestaurantManagment.Application.Common.DTOs.Menu.UpdateMenuDto;

namespace RestaurantManagment.Application.Common.Interfaces;

public interface IEmployeeService
{
    Task<PaginatedResult<ReservationDto>> GetRestaurantReservationsAsync(string restaurantId, string employeeId, int pageNumber = 1, int pageSize = 10);
    Task<PaginatedResult<ReservationDto>> GetReservationsByStatusAsync(string restaurantId, ReservationStatus status, string employeeId, int pageNumber = 1, int pageSize = 10);
    Task<ReservationDto?> GetReservationByIdAsync(string reservationId, string employeeId);
    Task<ReservationDto> UpdateReservationStatusAsync(string reservationId, ReservationStatus newStatus, string employeeId);
    Task<int> GetActiveReservationsCountAsync(string restaurantId, string employeeId);
    Task<IEnumerable<ReservationDto>> GetTodayReservationsAsync(string restaurantId, string employeeId);
    
    Task<IEnumerable<MenuDto>> GetRestaurantMenusAsync(string restaurantId, string employeeId);
    Task<MenuDto?> GetMenuByIdAsync(string menuId, string employeeId);
    Task<MenuDto> CreateMenuAsync(string restaurantId, CreateMenuDto dto, string employeeId);
    Task<MenuDto> UpdateMenuAsync(string menuId, UpdateMenuDto dto, string employeeId);
    Task DeleteMenuAsync(string menuId, string employeeId);
    
    Task<PaginatedResult<MenuItemDto>> GetMenuItemsAsync(string menuId, string employeeId, int pageNumber = 1, int pageSize = 20);
    Task<MenuItemDto?> GetMenuItemByIdAsync(string menuItemId, string employeeId);
    Task<MenuItemDto> CreateMenuItemAsync(string menuId, CreateMenuItemDto dto, string employeeId);
    Task<MenuItemDto> UpdateMenuItemAsync(string menuItemId, UpdateMenuItemDto dto, string employeeId);
    Task DeleteMenuItemAsync(string menuItemId, string employeeId);
    Task UpdateMenuItemAvailabilityAsync(string menuItemId, bool isAvailable, string employeeId);
    Task<int> GetMenuItemsCountAsync(string restaurantId, string employeeId);
    
    Task<IEnumerable<TableDto>> GetRestaurantTablesAsync(string restaurantId, string employeeId);
    Task<TableDto?> GetTableByIdAsync(string tableId, string employeeId);
    Task<TableDto> CreateTableAsync(string restaurantId, CreateTableDto dto, string employeeId);
    Task<TableDto> UpdateTableAsync(string tableId, UpdateTableDto dto, string employeeId);
    Task DeleteTableAsync(string tableId, string employeeId);
    Task<TableDto> UpdateTableStatusAsync(string tableId, TableStatus newStatus, string employeeId);
    Task<int> GetAvailableTablesCountAsync(string restaurantId, string employeeId);
}
