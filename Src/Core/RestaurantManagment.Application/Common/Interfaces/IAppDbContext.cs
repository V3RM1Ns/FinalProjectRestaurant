using Microsoft.EntityFrameworkCore;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Application.Common.Interfaces;

public interface IAppDbContext
{
    public new DbSet<AppUser> Users { get; set; }
    public DbSet<Restaurant> Restaurants { get; set; }
    public DbSet<Menu> Menus { get; set; }
    public DbSet<MenuItem> MenuItems { get; set; }
    public DbSet<Table> Tables { get; set; }
    public DbSet<Reservation> Reservations { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    
}