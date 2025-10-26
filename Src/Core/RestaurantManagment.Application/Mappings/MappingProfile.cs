using AutoMapper;
using RestaurantManagment.Application.Common.DTOs.Account;
using RestaurantManagment.Application.Common.DTOs.MenuItem;
using RestaurantManagment.Application.Common.DTOs.Restaurant;
using RestaurantManagment.Application.Common.DTOs.Admin;
using RestaurantManagment.Application.DTOs.Menu;
using RestaurantManagment.Application.DTOs.MenuItem;
using RestaurantManagment.Application.DTOs.Order;
using RestaurantManagment.Application.DTOs.Reservation;
using RestaurantManagment.Domain.Models;
using CreateRestaurantDto = RestaurantManagment.Application.Common.DTOs.Restaurant.CreateRestaurantDto;
using UpdateRestaurantDto = RestaurantManagment.Application.Common.DTOs.Restaurant.UpdateRestaurantDto;
using RestaurantResponseDto = RestaurantManagment.Application.DTOs.Restaurant.RestaurantResponseDto;

namespace RestaurantManagment.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
      
        CreateMap<Restaurant, RestaurantResponseDto>()
            .ForMember(dest => dest.OwnerName, opt => opt.MapFrom(src => src.Owner.FullName));
        CreateMap<Restaurant, RestaurantAdminListDto>()
            .ForMember(dest => dest.OwnerName, opt => opt.MapFrom(src => src.Owner.FullName))
            .ForMember(dest => dest.OwnerEmail, opt => opt.MapFrom(src => src.Owner.Email ?? string.Empty));
        CreateMap<CreateRestaurantDto, Restaurant>();
        CreateMap<UpdateRestaurantDto, Restaurant>();

     
        CreateMap<Menu, MenuResponseDto>()
            .ForMember(dest => dest.RestaurantName, opt => opt.MapFrom(src => src.Restaurant.Name));
        CreateMap<CreateMenuDto, Menu>();
        CreateMap<UpdateMenuDto, Menu>();

  
        CreateMap<MenuItem, MenuItemResponseDto>()
            .ForMember(dest => dest.MenuName, opt => opt.MapFrom(src => src.Menu.Name));
        CreateMap<CreateMenuItemDto, MenuItem>();
        CreateMap<UpdateMenuItemDto, MenuItem>();

    
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

        CreateMap<OrderItem, OrderItemResponseDto>()
            .ForMember(dest => dest.MenuItemName, opt => opt.MapFrom(src => src.MenuItem.Name));
        
        CreateMap<CreateOrderItemDto, OrderItem>();

   
        CreateMap<Reservation, ReservationResponseDto>()
            .ForMember(dest => dest.RestaurantName, opt => opt.MapFrom(src => src.Restaurant.Name))
            .ForMember(dest => dest.TableNumber, opt => opt.MapFrom(src => src.Table.TableNumber));
        
        CreateMap<CreateReservationDto, Reservation>();
        CreateMap<UpdateReservationDto, Reservation>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        
       
        CreateMap<UserRegisterDto, AppUser>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Username))
            .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
            .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FirstName + " " + src.LastName))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email));
        CreateMap<UserLoginDto, AppUser>();
        

        CreateMap<OwnershipApplication, OwnershipApplicationAdminDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName ?? string.Empty))
            .ForMember(dest => dest.UserEmail, opt => opt.MapFrom(src => src.User.Email ?? string.Empty))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
    }
}
