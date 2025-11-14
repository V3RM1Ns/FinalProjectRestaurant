namespace RestaurantManagment.Application.Common.DTOs.Customer;

public class CustomerStatisticsDto
{
    public int TotalOrders { get; set; }
    public int TotalReservations { get; set; }
    public int TotalReviews { get; set; }
    public decimal TotalSpent { get; set; }
    public int FavoriteRestaurantsCount { get; set; }
    public double AverageRatingGiven { get; set; }
    public string? FavoriteRestaurantName { get; set; }
    public string? FavoriteCuisine { get; set; }
}

