using System.Collections.Generic;

namespace RestaurantManagment.Domain.Models.Common
{
    public class OwnerDashboardDto
    {
        public string RestaurantId { get; set; } = string.Empty;
        public decimal TotalRevenue { get; set; }
        public decimal TodayRevenue { get; set; }
        public int TotalOrders { get; set; }
        public int TodayOrders { get; set; }
        public int ActiveReservations { get; set; }
        public int MenuItemCount { get; set; }
        public int EmployeeCount { get; set; }
        public List<TopSellingItemDto> TopSellingItems { get; set; } = new();
    }

    public class TopSellingItemDto
    {
        public string MenuItemId { get; set; } = string.Empty;
        public string MenuItemName { get; set; } = string.Empty;
        public int QuantitySold { get; set; }
    }
}