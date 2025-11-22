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
    public DbSet<JobPosting> JobPostings { get; set; }
    public DbSet<JobApplication> JobApplications { get; set; }
    public DbSet<OwnershipApplication> OwnershipApplications { get; set; }
    public DbSet<RestaurantApplication> RestaurantApplications { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<FavoriteRestaurant> FavoriteRestaurants { get; set; }
    public DbSet<LoyaltyPoint> LoyaltyPoints { get; set; }
    public DbSet<Reward> Rewards { get; set; }
    public DbSet<RewardRedemption> RewardRedemptions { get; set; }
    public DbSet<LoyaltyCode> LoyaltyCodes { get; set; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}