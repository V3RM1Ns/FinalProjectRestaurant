namespace RestaurantManagment.Application.Common.DTOs.Owner;

public class OwnerDashboardDto
{
    public string RestaurantId { get; set; } = string.Empty;
    public string RestaurantName { get; set; } = string.Empty;
    public decimal TotalRevenue { get; set; }
    public decimal TodayRevenue { get; set; }
    public int TotalOrders { get; set; }
    public int TodayOrders { get; set; }
    public int ActiveReservations { get; set; }
    public int MenuItemCount { get; set; }
    public int EmployeeCount { get; set; }
    public int PendingApplicationsCount { get; set; }
    public int PendingReviewsCount { get; set; }
    public double AverageRating { get; set; }
    public List<TopSellingItemDto> TopSellingItems { get; set; } = new();
    public List<RecentOrderDto> RecentOrders { get; set; } = new();
}

public class OwnerStatisticsDto
{
    public int TotalCustomers { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public int TotalEmployees { get; set; }
    public int TotalTables { get; set; }
    public int AvailableTables { get; set; }
    public int TotalMenuItems { get; set; }
    public double AverageOrderValue { get; set; }
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
}

public class TopSellingItemDto
{
    public string MenuItemId { get; set; } = string.Empty;
    public string MenuItemName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal Price { get; set; }
}

public class RecentOrderDto
{
    public string OrderId { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string OrderType { get; set; } = string.Empty;
}

public class RevenueChartDto
{
    public List<DailyRevenueDto> DailyRevenue { get; set; } = new();
    public decimal TotalRevenue { get; set; }
    public decimal AverageDailyRevenue { get; set; }
}

public class DailyRevenueDto
{
    public DateTime Date { get; set; }
    public decimal Revenue { get; set; }
    public int OrderCount { get; set; }
}

public class SalesReportDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public decimal AverageOrderValue { get; set; }
    public List<CategorySalesDto> CategorySales { get; set; } = new();
    public List<DailyRevenueDto> DailySales { get; set; } = new();
    public List<TopSellingItemDto> TopProducts { get; set; } = new();
}

public class CategorySalesDto
{
    public string Category { get; set; } = string.Empty;
    public int ItemsSold { get; set; }
    public decimal Revenue { get; set; }
    public decimal Percentage { get; set; }
}

public class TableDto
{
    public string Id { get; set; } = string.Empty;
    public int TableNumber { get; set; }
    public int Capacity { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string RestaurantId { get; set; } = string.Empty;
}

public class CreateTableDto
{
    public int TableNumber { get; set; }
    public int Capacity { get; set; }
    public string Status { get; set; } = "Available";
    public string? Location { get; set; }
}

public class UpdateTableDto
{
    public int TableNumber { get; set; }
    public int Capacity { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Location { get; set; }
}
