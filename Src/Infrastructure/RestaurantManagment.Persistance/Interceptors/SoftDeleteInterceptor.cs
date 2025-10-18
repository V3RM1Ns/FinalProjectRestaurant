using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using RestaurantManagment.Domain.Models.Common;

namespace RestaurantManagment.Persistance.Interceptors;

public class SoftDeleteInterceptor : SaveChangesInterceptor
{

}