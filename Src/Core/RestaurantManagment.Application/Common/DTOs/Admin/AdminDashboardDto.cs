using RestaurantManagment.Application.Common.DTOs.Account;
using RestaurantManagment.Domain.Models;

namespace RestaurantManagment.Application.Common.DTOs.Admin;

public class AdminDashboardDto
{
    public int TotalUsers { get; set; }
    public int TotalRestaurants { get; set; }
    public int TotalRestaurantOwners { get; set; }
    public int TotalEmployees { get; set; }
    public List<UserAdminShowDto> RecentUsers { get; set; } = new();
    public List<Restaurant> RecentRestaurants { get; set; } = new();
    public List<OwnershipApplication> RecentOwnershipApplications { get; set; } = new();
}
