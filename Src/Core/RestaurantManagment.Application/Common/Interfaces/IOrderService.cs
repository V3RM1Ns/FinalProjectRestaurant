using RestaurantManagment.Application.Common.Models;
using RestaurantManagment.Application.DTOs.Order;
using RestaurantManagment.Domain.Models;
using CreateOrderDto = RestaurantManagment.Application.Common.DTOs.Order.CreateOrderDto;

namespace RestaurantManagment.Application.Common.Interfaces;

public interface IOrderService
{
    Task<PaginatedList<OrderResponseDto>> GetRestaurantOrdersAsync(
        string restaurantId, 
        string userId, 
        int pageNumber = 1, 
        int pageSize = 10);
    
    Task<PaginatedList<OrderResponseDto>> GetRestaurantOrdersByStatusAsync(
        string restaurantId, 
        string userId, 
        OrderStatus status, 
        int pageNumber = 1, 
        int pageSize = 10);
    
    Task<OrderResponseDto> GetOrderByIdAsync(string orderId, string userId);
    
    Task<OrderResponseDto> UpdateOrderStatusAsync(string orderId, string userId, OrderStatus newStatus);
    
    Task<int> GetActiveOrdersCountAsync(string restaurantId, string userId);
    
    Task<List<OrderResponseDto>> GetTodayOrdersAsync(string restaurantId, string userId);

    Task<OrderResponseDto> CreateOrderAsync(CreateOrderDto createOrderDto, string customerId);
    
    Task<PaginatedList<OrderResponseDto>> GetCustomerOrdersAsync(
        string customerId, 
        int pageNumber = 1, 
        int pageSize = 10);
    
    Task<OrderResponseDto> CancelOrderAsync(string orderId, string customerId);
    Task<PaginatedList<OrderResponseDto>> GetReadyOrdersForDeliveryAsync(int pageNumber = 1, int pageSize = 10);
    
    Task<PaginatedList<OrderResponseDto>> GetDeliveryPersonOrdersAsync(string deliveryPersonId, int pageNumber = 1, int pageSize = 10);
    
    Task<OrderResponseDto> AcceptOrderForDeliveryAsync(string orderId, string deliveryPersonId);
    
    Task<OrderResponseDto> UpdateDeliveryOrderStatusAsync(string orderId, string deliveryPersonId, OrderStatus newStatus);
    
    Task<OrderResponseDto> GetDeliveryOrderDetailsAsync(string orderId, string deliveryPersonId);
}
