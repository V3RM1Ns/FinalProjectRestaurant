using AutoMapper;
using RestaurantManagment.Application.DTOs.Restaurant;
using RestaurantManagment.Application.DTOs.Menu;
using RestaurantManagment.Application.DTOs.MenuItem;
using RestaurantManagment.Application.DTOs.Order;
using RestaurantManagment.Application.DTOs.Reservation;
using RestaurantManagment.Application.Common.DTOs.Account;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        
        // Restaurant Mappings
        CreateMap<Restaurant, RestaurantResponseDto>()
            .ForMember(dest => dest.OwnerName, opt => opt.MapFrom(src => src.Owner.FullName));
        CreateMap<CreateRestaurantDto, Restaurant>();
        CreateMap<UpdateRestaurantDto, Restaurant>();

        // Menu Mappings
        CreateMap<Menu, MenuResponseDto>()
            .ForMember(dest => dest.RestaurantName, opt => opt.MapFrom(src => src.Restaurant.Name));
        CreateMap<CreateMenuDto, Menu>();
        CreateMap<UpdateMenuDto, Menu>();

        // MenuItem Mappings
        CreateMap<MenuItem, MenuItemResponseDto>()
            .ForMember(dest => dest.MenuName, opt => opt.MapFrom(src => src.Menu.Name));
        CreateMap<CreateMenuItemDto, MenuItem>();
        CreateMap<UpdateMenuItemDto, MenuItem>();

        // Order Mappings
        CreateMap<Order, OrderResponseDto>()
            .ForMember(dest => dest.RestaurantName, opt => opt.MapFrom(src => src.Restaurant.Name))
            .ForMember(dest => dest.TableNumber, opt => opt.MapFrom(src => src.Table != null ? src.Table.TableNumber : (int?)null))
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.FullName : null))
            .ForMember(dest => dest.DeliveryPersonName, opt => opt.MapFrom(src => src.DeliveryPerson != null ? src.DeliveryPerson.FullName : null))
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.OrderItems));
        
        CreateMap<CreateOrderDto, Order>()
            .ForMember(dest => dest.OrderItems, opt => opt.Ignore());
        
        CreateMap<UpdateOrderDto, Order>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // OrderItem Mappings
        CreateMap<OrderItem, OrderItemResponseDto>()
            .ForMember(dest => dest.MenuItemName, opt => opt.MapFrom(src => src.MenuItem.Name));
        
        CreateMap<CreateOrderItemDto, OrderItem>();

        // Reservation Mappings
        CreateMap<Reservation, ReservationResponseDto>()
            .ForMember(dest => dest.RestaurantName, opt => opt.MapFrom(src => src.Restaurant.Name))
            .ForMember(dest => dest.TableNumber, opt => opt.MapFrom(src => src.Table.TableNumber));
        
        CreateMap<CreateReservationDto, Reservation>();
        CreateMap<UpdateReservationDto, Reservation>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // User Mappings
        CreateMap<UserRegisterDto, AppUser>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Username))
            .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
            .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FirstName + " " + src.LastName))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email));
        CreateMap<UserLoginDto, AppUser>();
    }
}
