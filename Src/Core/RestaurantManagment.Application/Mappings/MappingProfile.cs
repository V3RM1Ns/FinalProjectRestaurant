using AutoMapper;
using RestaurantManagment.Application.Common.DTOs.Account;
using RestaurantManagment.Application.Common.DTOs.Employee;
using RestaurantManagment.Application.Common.DTOs.JobApplication;
using RestaurantManagment.Application.Common.DTOs.MenuItem;
using RestaurantManagment.Application.Common.DTOs.Restaurant;
using RestaurantManagment.Application.Common.DTOs.Admin;
using RestaurantManagment.Application.Common.DTOs.Order;
using RestaurantManagment.Application.Common.DTOs.Owner;
using RestaurantManagment.Application.Common.DTOs.Review;
using RestaurantManagment.Application.DTOs.Menu;
using RestaurantManagment.Application.DTOs.MenuItem;
using RestaurantManagment.Application.DTOs.Order;
using RestaurantManagment.Application.DTOs.Reservation;
using RestaurantManagment.Domain.Models;
using CreateOrderDto = RestaurantManagment.Application.DTOs.Order.CreateOrderDto;
using CreateOrderItemDto = RestaurantManagment.Application.DTOs.Order.CreateOrderItemDto;
using CreateRestaurantDto = RestaurantManagment.Application.Common.DTOs.Restaurant.CreateRestaurantDto;
using UpdateRestaurantDto = RestaurantManagment.Application.Common.DTOs.Restaurant.UpdateRestaurantDto;
using RestaurantResponseDto = RestaurantManagment.Application.DTOs.Restaurant.RestaurantResponseDto;
using UpdateOrderDto = RestaurantManagment.Application.DTOs.Order.UpdateOrderDto;

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
        CreateMap<MenuItem, RestaurantManagment.Application.Common.DTOs.MenuItem.MenuItemDto>()
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
        
        CreateMap<Reservation, RestaurantManagment.Application.Common.DTOs.Reservation.ReservationDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
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

      
        CreateMap<AppUser, EmployeeDto>()
            .ForMember(dest => dest.EmployerRestaurantId, opt => opt.MapFrom(src => src.EmployerRestaurantId))
            .ForMember(dest => dest.RestaurantName, opt => opt.MapFrom(src => 
                src.EmployerRestaurant != null ? src.EmployerRestaurant.Name : null))
            .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.PhoneNumber))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email ?? string.Empty))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => !src.IsDeleted));

        CreateMap<CreateEmployeeDto, AppUser>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
            .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.Phone))
            .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address))
            .ForMember(dest => dest.EmailConfirmed, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.FirstName, opt => opt.Ignore())
            .ForMember(dest => dest.LastName, opt => opt.Ignore());

        CreateMap<UpdateEmployeeDto, AppUser>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
            .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.Phone))
            .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.FirstName, opt => opt.Ignore())
            .ForMember(dest => dest.LastName, opt => opt.Ignore())
            .ForAllMembers(opts => opts.Condition((_, _, srcMember) => srcMember != null));

   
        CreateMap<JobApplication, JobApplicationDto>()
            .ForMember(dest => dest.JobTitle, opt => opt.MapFrom(src => src.JobPosting.Title))
            .ForMember(dest => dest.RestaurantName, opt => opt.MapFrom(src => src.JobPosting.Restaurant.Name))
            .ForMember(dest => dest.ApplicantName, opt => opt.MapFrom(src => src.Applicant.FullName))
            .ForMember(dest => dest.ApplicantEmail, opt => opt.MapFrom(src => src.Applicant.Email ?? string.Empty))
            .ForMember(dest => dest.ApplicantPhone, opt => opt.MapFrom(src => src.Applicant.PhoneNumber ?? string.Empty));

  
        CreateMap<Review, ReviewDto>()
            .ForMember(dest => dest.RestaurantName, opt => opt.MapFrom(src => src.Restaurant.Name))
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer.FullName))
            .ForMember(dest => dest.CustomerEmail, opt => opt.MapFrom(src => src.Customer.Email));

        
        CreateMap<Order, OrderDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.RestaurantName, opt => opt.MapFrom(src => src.Restaurant.Name))
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.FullName : null))
            .ForMember(dest => dest.OrderItems, opt => opt.MapFrom(src => src.OrderItems));

        CreateMap<OrderItem, OrderItemDto>()
            .ForMember(dest => dest.MenuItemName, opt => opt.MapFrom(src => src.MenuItem.Name))
            .ForMember(dest => dest.Subtotal, opt => opt.MapFrom(src => src.UnitPrice * src.Quantity));

      
        CreateMap<Table, TableDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
        
        CreateMap<CreateTableDto, Table>();
        CreateMap<UpdateTableDto, Table>();
        
        CreateMap<Order, RecentOrderDto>()
            .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.FullName : "Guest"))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.OrderType, opt => opt.MapFrom(src => src.Type.ToString()));

      
        CreateMap<MenuItem, TopSellingItemDto>()
            .ForMember(dest => dest.MenuItemId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.MenuItemName, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.QuantitySold, opt => opt.Ignore())
            .ForMember(dest => dest.TotalRevenue, opt => opt.Ignore());

  
        CreateMap<(DateTime Date, decimal Revenue, int OrderCount), DailyRevenueDto>()
            .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.Date))
            .ForMember(dest => dest.Revenue, opt => opt.MapFrom(src => src.Revenue))
            .ForMember(dest => dest.OrderCount, opt => opt.MapFrom(src => src.OrderCount));
    }
}
