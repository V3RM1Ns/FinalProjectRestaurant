using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using RestaurantManagment.Domain.Enums;
using RestaurantManagment.Domain.Models;
using RestaurantManagment.Persistance.Data;

namespace RestaurantManagment.Persistance.Seeders;

public static class DbSeeder
{
    public static async Task SeedDataAsync(IServiceProvider serviceProvider)
    {
        var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        // Database'i oluştur - migration yerine mevcut durumu kontrol et
        try
        {
            await context.Database.MigrateAsync();
        }
        catch (Exception)
        {
            // Eğer migration hatası varsa, veritabanı zaten var demektir, devam et
        }

        // Rolleri oluştur
        await SeedRolesAsync(roleManager);

        // Kullanıcıları oluştur
        var owner = await SeedUsersAsync(userManager);

        // Eğer owner yoksa dön
        if (owner == null) return;

        // Restoranları oluştur
        var restaurants = await SeedRestaurantsAsync(context, owner.Id);

        if (restaurants.Count == 0) return;

        // Her restoran için verileri oluştur
        foreach (var restaurant in restaurants)
        {
            await SeedEmployeesAsync(context, userManager, restaurant.Id);
            await SeedMenusAsync(context, restaurant.Id);
            await SeedTablesAsync(context, restaurant.Id);
            await SeedOrdersAsync(context, restaurant.Id);
            await SeedReservationsAsync(context, restaurant.Id);
            await SeedReviewsAsync(context, restaurant.Id);
            await SeedJobPostingsAsync(context, restaurant.Id);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
    {
        string[] roles = { "Admin", "RestaurantOwner", "Employee", "Customer", "Delivery" };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }
    }

    private static async Task<AppUser?> SeedUsersAsync(UserManager<AppUser> userManager)
    {
        // Admin kullanıcı
        var admin = await userManager.FindByEmailAsync("admin@gmail.com");
        if (admin == null)
        {
            admin = new AppUser
            {
                UserName = "admin@gmail.com",
                Email = "admin@gmail.com",
                EmailConfirmed = true,
                FullName = "Admin User",
                FirstName = "Admin",
                LastName = "User",
                PhoneNumber = "+905551234567"
            };
            await userManager.CreateAsync(admin, "Admin123!");
            await userManager.AddToRoleAsync(admin, "Admin");
        }

        // RestaurantOwner kullanıcı
        var owner = await userManager.FindByEmailAsync("owner@gmail.com");
        if (owner == null)
        {
            owner = new AppUser
            {
                UserName = "owner@gmail.com",
                Email = "owner@gmail.com",
                EmailConfirmed = true,
                FullName = "Ahmet Yılmaz",
                FirstName = "Ahmet",
                LastName = "Yılmaz",
                PhoneNumber = "+905551234568"
            };
            await userManager.CreateAsync(owner, "Owner123!");
            await userManager.AddToRoleAsync(owner, "RestaurantOwner");
        }

        // Customer kullanıcılar
        for (int i = 1; i <= 5; i++)
        {
            var customerEmail = $"customer{i}@gmail.com";
            var customer = await userManager.FindByEmailAsync(customerEmail);
            if (customer == null)
            {
                customer = new AppUser
                {
                    UserName = customerEmail,
                    Email = customerEmail,
                    EmailConfirmed = true,
                    FullName = $"Müşteri {i}",
                    FirstName = $"Müşteri",
                    LastName = $"{i}",
                    PhoneNumber = $"+90555123456{i}"
                };
                await userManager.CreateAsync(customer, $"Customer{i}23!");
                await userManager.AddToRoleAsync(customer, "Customer");
            }
        }

        // Employee kullanıcılar
        for (int i = 1; i <= 3; i++)
        {
            var employeeEmail = $"employee{i}@gmail.com";
            var employee = await userManager.FindByEmailAsync(employeeEmail);
            if (employee == null)
            {
                employee = new AppUser
                {
                    UserName = employeeEmail,
                    Email = employeeEmail,
                    EmailConfirmed = true,
                    FullName = $"Çalışan {i}",
                    FirstName = $"Çalışan",
                    LastName = $"{i}",
                    PhoneNumber = $"+90555234567{i}"
                };
                await userManager.CreateAsync(employee, $"Employee{i}23!");
                await userManager.AddToRoleAsync(employee, "Employee");
            }
        }

        // Delivery kullanıcı
        var delivery = await userManager.FindByEmailAsync("delivery@gmail.com");
        if (delivery == null)
        {
            delivery = new AppUser
            {
                UserName = "delivery@gmail.com",
                Email = "delivery@gmail.com",
                EmailConfirmed = true,
                FullName = "Teslimat Görevlisi",
                FirstName = "Teslimat",
                LastName = "Görevlisi",
                PhoneNumber = "+905551234569"
            };
            await userManager.CreateAsync(delivery, "Delivery123!");
            await userManager.AddToRoleAsync(delivery, "Delivery");
        }

        return owner;
    }

    private static async Task<List<Restaurant>> SeedRestaurantsAsync(AppDbContext context, string ownerId)
    {
        var restaurants = new List<Restaurant>();

        // Owner'a ait restoran var mı kontrol et
        var existingRestaurants = await context.Restaurants.Where(r => r.OwnerId == ownerId && !r.IsDeleted).ToListAsync();
        
        if (existingRestaurants.Count == 0)
        {
            // Owner'ın restoranı yoksa oluştur
            var restaurant1 = new Restaurant
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Lezzet Durağı",
                Description = "Türk mutfağının en lezzetli yemeklerini modern bir atmosferde sunuyoruz.",
                Address = "Kızılay Mahallesi, Atatürk Bulvarı No: 123, Çankaya/Ankara",
                PhoneNumber = "+903121234567",
                Email = "info@lezzetduragi.com",
                Website = "www.lezzetduragi.com",
                OwnerId = ownerId,
                Rate = 4.5m,
                ImageUrl = "/adana-kebab.jpg",
                Category = RestaurantCategory.Turkish,
                Latitude = 39.9208,
                Longitude = 32.8541
            };

            var restaurant2 = new Restaurant
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Pizza Palace",
                Description = "İtalyan pizza ve pasta çeşitleriyle hizmetinizdeyiz.",
                Address = "Bahçelievler Mahallesi, İstiklal Caddesi No: 45, Çankaya/Ankara",
                PhoneNumber = "+903129876543",
                Email = "info@pizzapalace.com",
                Website = "www.pizzapalace.com",
                OwnerId = ownerId,
                Rate = 4.3m,
                ImageUrl = "/italian-pizza-restaurant.jpg",
                Category = RestaurantCategory.Italian,
                Latitude = 39.9109,
                Longitude = 32.8597
            };

            var restaurant3 = new Restaurant
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Sushi Tokyo",
                Description = "Otantik Japon mutfağı, taze ve kaliteli suşi çeşitleri.",
                Address = "Kavaklidere, Tunalı Hilmi Caddesi No: 78, Çankaya/Ankara",
                PhoneNumber = "+903125554433",
                Email = "info@sushitokyo.com",
                Website = "www.sushitokyo.com",
                OwnerId = ownerId,
                Rate = 4.7m,
                ImageUrl = "/japanese-sushi-restaurant.png",
                Category = RestaurantCategory.Japanese,
                Latitude = 39.9189,
                Longitude = 32.8536
            };

            var restaurant4 = new Restaurant
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Burger House",
                Description = "Lezzetli burgerler ve patates kızartmaları ile fast food deneyimi.",
                Address = "Ümitköy, Çayyolu Caddesi No: 156, Yenimahalle/Ankara",
                PhoneNumber = "+903123336677",
                Email = "info@burgerhouse.com",
                Website = "www.burgerhouse.com",
                OwnerId = ownerId,
                Rate = 4.2m,
                ImageUrl = "/burger-meal.jpg",
                Category = RestaurantCategory.FastFood,
                Latitude = 39.9334,
                Longitude = 32.7569
            };

            var restaurant5 = new Restaurant
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Vejetaryen Köşe",
                Description = "Sağlıklı ve lezzetli vejetaryen ve vegan yemek seçenekleri.",
                Address = "Beşevler, 6. Cadde No: 34, Yenimahalle/Ankara",
                PhoneNumber = "+903127778899",
                Email = "info@vejetaryenkose.com",
                Website = "www.vejetaryenkose.com",
                OwnerId = ownerId,
                Rate = 4.6m,
                ImageUrl = "/pasta-dish.jpg",
                Category = RestaurantCategory.Vegetarian,
                Latitude = 39.9456,
                Longitude = 32.7891
            };

            restaurants.Add(restaurant1);
            restaurants.Add(restaurant2);
            restaurants.Add(restaurant3);
            restaurants.Add(restaurant4);
            restaurants.Add(restaurant5);

            context.Restaurants.AddRange(restaurants);
            await context.SaveChangesAsync();
        }
        else
        {
            restaurants = existingRestaurants;
        }

        return restaurants;
    }

    private static async Task SeedMenusAsync(AppDbContext context, string restaurantId)
    {
        if (await context.Menus.AnyAsync(m => m.RestaurantId == restaurantId))
            return;

        var restaurant = await context.Restaurants.FindAsync(restaurantId);
        if (restaurant == null) return;

        if (restaurant.Name == "Lezzet Durağı")
        {
            var mainMenu = new Menu
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Ana Menü",
                Description = "Geleneksel Türk yemekleri",
                RestaurantId = restaurantId
            };
            context.Menus.Add(mainMenu);
            await context.SaveChangesAsync();

            var menuItems = new List<MenuItem>
            {
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Adana Kebap",
                    Description = "Acılı kıyma kebap, pilav ve salata ile",
                    Price = 185.00m,
                    MenuId = mainMenu.Id,
                    Category = "Ana Yemek",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "İskender Kebap",
                    Description = "Döner, yoğurt ve tereyağı ile",
                    Price = 220.00m,
                    MenuId = mainMenu.Id,
                    Category = "Ana Yemek",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Kuzu Tandır",
                    Description = "Fırında pişmiş yumuşacık kuzu eti",
                    Price = 280.00m,
                    MenuId = mainMenu.Id,
                    Category = "Ana Yemek",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Mercimek Çorbası",
                    Description = "Geleneksel kırmızı mercimek çorbası",
                    Price = 45.00m,
                    MenuId = mainMenu.Id,
                    Category = "Çorba",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Türk Kahvesi",
                    Description = "Geleneksel Türk kahvesi",
                    Price = 35.00m,
                    MenuId = mainMenu.Id,
                    Category = "İçecek",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Ayran",
                    Description = "Ev yapımı yoğurt ayranı",
                    Price = 25.00m,
                    MenuId = mainMenu.Id,
                    Category = "İçecek",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Meze Tabağı",
                    Description = "Karışık Türk mezeleri",
                    Price = 120.00m,
                    MenuId = mainMenu.Id,
                    Category = "Meze",
                    IsAvailable = true
                }
            };

            context.MenuItems.AddRange(menuItems);
        }
        else if (restaurant.Name == "Pizza Palace")
        {
            var pizzaMenu = new Menu
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Pizza Menüsü",
                Description = "İtalyan usulü pizzalar",
                RestaurantId = restaurantId
            };
            context.Menus.Add(pizzaMenu);
            await context.SaveChangesAsync();

            var menuItems = new List<MenuItem>
            {
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Margherita Pizza",
                    Description = "Domates, mozzarella ve fesleğen",
                    Price = 150.00m,
                    MenuId = pizzaMenu.Id,
                    Category = "Pizza",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Pepperoni Pizza",
                    Description = "Domates, mozzarella ve pepperoni",
                    Price = 175.00m,
                    MenuId = pizzaMenu.Id,
                    Category = "Pizza",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Karışık Pizza",
                    Description = "Sucuk, salam, mantar, biber, zeytin",
                    Price = 185.00m,
                    MenuId = pizzaMenu.Id,
                    Category = "Pizza",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Fettuccine Alfredo",
                    Description = "Krema soslu makarna",
                    Price = 140.00m,
                    MenuId = pizzaMenu.Id,
                    Category = "Pasta",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Limonata",
                    Description = "Taze sıkılmış limonata",
                    Price = 40.00m,
                    MenuId = pizzaMenu.Id,
                    Category = "İçecek",
                    IsAvailable = true
                }
            };

            context.MenuItems.AddRange(menuItems);
        }
        else if (restaurant.Name == "Sushi Tokyo")
        {
            var sushiMenu = new Menu
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Sushi Menüsü",
                Description = "Japon usulü suşi ve sashimi",
                RestaurantId = restaurantId
            };
            context.Menus.Add(sushiMenu);
            await context.SaveChangesAsync();

            var menuItems = new List<MenuItem>
            {
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Salmon Sashimi",
                    Description = "Taze somon balığı dilimleri",
                    Price = 300.00m,
                    MenuId = sushiMenu.Id,
                    Category = "Sashimi",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Tuna Sashimi",
                    Description = "Taze ton balığı dilimleri",
                    Price = 350.00m,
                    MenuId = sushiMenu.Id,
                    Category = "Sashimi",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "California Roll",
                    Description = "Avokado, salatalık ve yengeç eti ile",
                    Price = 180.00m,
                    MenuId = sushiMenu.Id,
                    Category = "Maki",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Spicy Tuna Roll",
                    Description = "Acılı ton balığı, avokado ve salatalık ile",
                    Price = 200.00m,
                    MenuId = sushiMenu.Id,
                    Category = "Maki",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Tempura",
                    Description = "Kızartılmış sebze ve deniz ürünleri",
                    Price = 220.00m,
                    MenuId = sushiMenu.Id,
                    Category = "Atıştırmalık",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Miso Çorbası",
                    Description = "Japon usulü miso çorbası",
                    Price = 50.00m,
                    MenuId = sushiMenu.Id,
                    Category = "Çorba",
                    IsAvailable = true
                }
            };

            context.MenuItems.AddRange(menuItems);
        }
        else if (restaurant.Name == "Burger House")
        {
            var burgerMenu = new Menu
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Burger Menüsü",
                Description = "Lezzetli burgerler ve atıştırmalıklar",
                RestaurantId = restaurantId
            };
            context.Menus.Add(burgerMenu);
            await context.SaveChangesAsync();

            var menuItems = new List<MenuItem>
            {
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Cheeseburger",
                    Description = "Köfte, peynir, marul, domates ve özel sos ile",
                    Price = 200.00m,
                    MenuId = burgerMenu.Id,
                    Category = "Burger",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Double Cheeseburger",
                    Description = "İki kat köfte, iki kat peynir ile",
                    Price = 250.00m,
                    MenuId = burgerMenu.Id,
                    Category = "Burger",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Veggie Burger",
                    Description = "Vejetaryen burger, sebzeler ve özel sos ile",
                    Price = 180.00m,
                    MenuId = burgerMenu.Id,
                    Category = "Burger",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Patates Kızartması",
                    Description = "Kızartılmış taze patates",
                    Price = 50.00m,
                    MenuId = burgerMenu.Id,
                    Category = "Atıştırmalık",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Soğan Halkası",
                    Description = "Kızartılmış soğan halkaları",
                    Price = 40.00m,
                    MenuId = burgerMenu.Id,
                    Category = "Atıştırmalık",
                    IsAvailable = true
                }
            };

            context.MenuItems.AddRange(menuItems);
        }
        else if (restaurant.Name == "Vejetaryen Köşe")
        {
            var vegeMenu = new Menu
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Vejetaryen Menü",
                Description = "Vejetaryen ve vegan yemekler",
                RestaurantId = restaurantId
            };
            context.Menus.Add(vegeMenu);
            await context.SaveChangesAsync();

            var menuItems = new List<MenuItem>
            {
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Sebze Tabağı",
                    Description = "Mevsim sebzeleri ile hazırlanmış tabak",
                    Price = 100.00m,
                    MenuId = vegeMenu.Id,
                    Category = "Salata",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Nohutlu Pilav",
                    Description = "Baharatlı nohut ve pirinç pilavı",
                    Price = 120.00m,
                    MenuId = vegeMenu.Id,
                    Category = "Ana Yemek",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Zeytinyağlı Enginar",
                    Description = "Zeytinyağlı ve limonlu enginar kalbi",
                    Price = 80.00m,
                    MenuId = vegeMenu.Id,
                    Category = "Meze",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Vegan Burger",
                    Description = "Kinoalı ve sebzeli vegan burger",
                    Price = 200.00m,
                    MenuId = vegeMenu.Id,
                    Category = "Burger",
                    IsAvailable = true
                },
                new MenuItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Chia Puding",
                    Description = "Chia tohumu, badem sütü ve meyvelerle",
                    Price = 70.00m,
                    MenuId = vegeMenu.Id,
                    Category = "Tatlı",
                    IsAvailable = true
                }
            };

            context.MenuItems.AddRange(menuItems);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedTablesAsync(AppDbContext context, string restaurantId)
    {
        if (await context.Tables.AnyAsync(t => t.RestaurantId == restaurantId))
            return;

        var tables = new List<Table>();
        for (int i = 1; i <= 10; i++)
        {
            tables.Add(new Table
            {
                Id = Guid.NewGuid().ToString(),
                TableNumber = i,
                Capacity = i % 3 == 0 ? 6 : (i % 2 == 0 ? 4 : 2),
                Status = TableStatus.Available,
                RestaurantId = restaurantId,
                Location = i <= 5 ? "İç Mekan" : "Dış Mekan"
            });
        }

        context.Tables.AddRange(tables);
        await context.SaveChangesAsync();
    }

    private static async Task SeedOrdersAsync(AppDbContext context, string restaurantId)
    {
        if (await context.Orders.AnyAsync(o => o.RestaurantId == restaurantId))
            return;

        var menuItems = await context.MenuItems
            .Where(mi => mi.Menu.RestaurantId == restaurantId)
            .ToListAsync();

        if (menuItems.Count == 0) return;

        var customers = await context.Users
            .Where(u => u.Email != null && u.Email.StartsWith("customer"))
            .ToListAsync();

        var random = new Random();
        var statuses = new[] { OrderStatus.Completed, OrderStatus.Completed, OrderStatus.Completed, OrderStatus.Preparing, OrderStatus.Ready, OrderStatus.Served };

        for (int i = 0; i < 30; i++)
        {
            var orderDate = DateTime.UtcNow.AddDays(-random.Next(0, 30));
            var customer = customers[random.Next(customers.Count)];
            var status = statuses[random.Next(statuses.Length)];

            var order = new Order
            {
                Id = Guid.NewGuid().ToString(),
                OrderDate = orderDate,
                CustomerId = customer.Id,
                RestaurantId = restaurantId,
                Status = status,
                Type = random.Next(3) == 0 ? OrderType.Delivery : OrderType.DineIn,
                TotalAmount = 0,
                SpecialRequests = status == OrderStatus.Completed ? "Sipariş tamamlandı" : null
            };

            // 2-5 arası ürün ekle
            var itemCount = random.Next(2, 6);
            decimal totalAmount = 0;

            for (int j = 0; j < itemCount; j++)
            {
                var menuItem = menuItems[random.Next(menuItems.Count)];
                var quantity = random.Next(1, 4);
                var price = menuItem.Price;

                totalAmount += price * quantity;

                var orderItem = new OrderItem
                {
                    Id = Guid.NewGuid().ToString(),
                    OrderId = order.Id,
                    MenuItemId = menuItem.Id,
                    Quantity = quantity,
                    UnitPrice = price
                };

                order.OrderItems.Add(orderItem);
            }

            order.TotalAmount = totalAmount;
            context.Orders.Add(order);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedReservationsAsync(AppDbContext context, string restaurantId)
    {
        if (await context.Reservations.AnyAsync(r => r.RestaurantId == restaurantId))
            return;

        var tables = await context.Tables
            .Where(t => t.RestaurantId == restaurantId)
            .ToListAsync();

        var customers = await context.Users
            .Where(u => u.Email != null && u.Email.StartsWith("customer"))
            .ToListAsync();

        var random = new Random();
        var statuses = new[] { ReservationStatus.Confirmed, ReservationStatus.Confirmed, ReservationStatus.Pending, ReservationStatus.Completed };

        for (int i = 0; i < 15; i++)
        {
            var reservationDate = DateTime.UtcNow.AddDays(random.Next(-7, 14));
            var customer = customers[random.Next(customers.Count)];
            var table = tables[random.Next(tables.Count)];
            var status = statuses[random.Next(statuses.Length)];

            var reservation = new Reservation
            {
                Id = Guid.NewGuid().ToString(),
                ReservationDate = reservationDate,
                NumberOfGuests = random.Next(2, table.Capacity + 1),
                CustomerId = customer.Id,
                CustomerName = customer.FullName,
                CustomerPhone = customer.PhoneNumber ?? "+905551234567",
                CustomerEmail = customer.Email,
                RestaurantId = restaurantId,
                TableId = table.Id,
                Status = status,
                SpecialRequests = i % 3 == 0 ? "Pencere kenarı masa lütfen" : null
            };

            context.Reservations.Add(reservation);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedReviewsAsync(AppDbContext context, string restaurantId)
    {
        if (await context.Reviews.AnyAsync(r => r.RestaurantId == restaurantId))
            return;

        var customers = await context.Users
            .Where(u => u.Email != null && u.Email.StartsWith("customer"))
            .ToListAsync();

        var random = new Random();
        var comments = new[]
        {
            "Harika bir deneyimdi, kesinlikle tekrar geleceğim!",
            "Yemekler çok lezzetliydi, personel çok ilgili.",
            "Fiyatlar biraz yüksek ama kaliteli.",
            "Ortam çok güzel, aile ile gelmek için ideal.",
            "Servis biraz yavaştı ama yemekler harikaydı.",
            "Tavsiye ederim, çok memnun kaldık.",
            "Menü çeşitliliği güzel, her damak zevkine uygun.",
            "Temizlik ve hijyen konusunda çok özenli."
        };

        var statuses = new[] { "Approved", "Approved", "Approved", "Pending" };

        for (int i = 0; i < 20; i++)
        {
            var customer = customers[random.Next(customers.Count)];
            var rating = random.Next(3, 6);
            var status = statuses[random.Next(statuses.Length)];

            var review = new Review
            {
                Id = Guid.NewGuid().ToString(),
                Rating = rating,
                Comment = comments[random.Next(comments.Length)],
                CustomerId = customer.Id,
                RestaurantId = restaurantId,
                Status = status,
                OwnerResponse = status == "Approved" && i % 3 == 0 
                    ? "Teşekkür ederiz, tekrar bekleriz!" 
                    : null
            };

            context.Reviews.Add(review);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedJobPostingsAsync(AppDbContext context, string restaurantId)
    {
        if (await context.JobPostings.AnyAsync(j => j.RestaurantId == restaurantId))
            return;

        var jobPostings = new List<JobPosting>
        {
            new JobPosting
            {
                Id = Guid.NewGuid().ToString(),
                Title = "Aşçı",
                Description = "Deneyimli aşçı aranıyor. Türk mutfağı bilgisi şart.",
                Requirements = "En az 3 yıl deneyim, hijyen eğitimi",
                Salary = 25000m,
                RestaurantId = restaurantId,
                PostedDate = DateTime.UtcNow.AddDays(-10)
            },
            new JobPosting
            {
                Id = Guid.NewGuid().ToString(),
                Title = "Garson",
                Description = "Part-time garson aranıyor.",
                Requirements = "Müşteri ilişkileri konusunda yetenekli",
                Salary = 18000m,
                RestaurantId = restaurantId,
                PostedDate = DateTime.UtcNow.AddDays(-5)
            }
        };

        context.JobPostings.AddRange(jobPostings);
        await context.SaveChangesAsync();

        // Bazı başvurular ekle
        var customers = await context.Users
            .Where(u => u.Email != null && u.Email.StartsWith("customer"))
            .Take(3)
            .ToListAsync();

        var random = new Random();
        foreach (var jobPosting in jobPostings.Take(1))
        {
            foreach (var customer in customers)
            {
                var application = new JobApplication
                {
                    Id = Guid.NewGuid().ToString(),
                    JobPostingId = jobPosting.Id,
                    ApplicantId = customer.Id,
                    CoverLetter = "İlgili pozisyon için başvurmak istiyorum. Deneyimli ve çalışkanım.",
                    Status = "Pending",
                    ApplicationDate = DateTime.UtcNow.AddDays(-random.Next(1, 5))
                };

                context.JobApplications.Add(application);
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedEmployeesAsync(AppDbContext context, UserManager<AppUser> userManager, string restaurantId)
    {
        // Bu restoranda çalışan var mı kontrol et
        var existingEmployees = await context.Users
            .Where(u => u.EmployerRestaurantId == restaurantId && !u.IsDeleted)
            .CountAsync();

        if (existingEmployees >= 2) return;

        // Her restoran için 2-3 çalışan oluştur
        var random = new Random();
        var employeeCount = random.Next(2, 4); // 2 veya 3 çalışan

        for (int i = 1; i <= employeeCount; i++)
        {
            var uniqueId = Guid.NewGuid().ToString().Substring(0, 8);
            var employeeEmail = $"employee_{uniqueId}@gmail.com";
            
            var employee = await userManager.FindByEmailAsync(employeeEmail);
            if (employee == null)
            {
                var positions = new[] { "Garson", "Aşçı", "Komi", "Kasiyer", "Mutfak Personeli" };
                var names = new[] { "Mehmet", "Ayşe", "Fatma", "Ali", "Zeynep", "Ahmet", "Elif", "Mustafa", "Emine", "Hasan" };
                var surnames = new[] { "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Öztürk", "Aydın", "Arslan", "Doğan" };

                var firstName = names[random.Next(names.Length)];
                var lastName = surnames[random.Next(surnames.Length)];
                var position = positions[random.Next(positions.Length)];

                employee = new AppUser
                {
                    UserName = employeeEmail,
                    Email = employeeEmail,
                    EmailConfirmed = true,
                    FullName = $"{firstName} {lastName} ({position})",
                    FirstName = firstName,
                    LastName = lastName,
                    PhoneNumber = $"+90555{random.Next(100, 999)}{random.Next(1000, 9999)}",
                    EmployerRestaurantId = restaurantId,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                var result = await userManager.CreateAsync(employee, "Employee123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(employee, "Employee");
                }
            }
        }

        await context.SaveChangesAsync();
    }
}
