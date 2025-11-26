using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RestaurantManagment.Domain.Enums;
using RestaurantManagment.Domain.Models;
using RestaurantManagment.Persistance.Data;

namespace RestaurantManagment.WebAPI;

public static class SeedData
{
    public static async Task Initialize(IServiceProvider serviceProvider)
    {
        var context = serviceProvider.GetRequiredService<AppDbContext>();
        var userManager = serviceProvider.GetRequiredService<UserManager<AppUser>>();
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var logger = serviceProvider.GetRequiredService<ILogger<Program>>();

        try
        {
            // Veritabanını temizle
            logger.LogInformation("Veritabanı temizleniyor...");
            await context.Database.EnsureCreatedAsync();

            // Rolleri oluştur
            await CreateRoles(roleManager, logger);

            // Admin kullanıcısı
            var admin = await CreateUser(userManager, "admin@restaurant.com", "Admin123!", "AdminUser", 
                "Admin Kullanıcı", "+90 555 000 0001", "Admin Adresi", logger);
            await userManager.AddToRoleAsync(admin, "Admin");

            // Restoran sahibi
            var owner = await CreateUser(userManager, "owner@restaurant.com", "Owner123!", "RestaurantOwner",
                "Ahmet Yılmaz", "+90 555 111 0001", "Kadıköy, İstanbul", logger);
            await userManager.AddToRoleAsync(owner, "RestaurantOwner");

            // Restoran oluştur
            var restaurant = new Restaurant
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Sultanahmet Köftecisi",
                Description = "1920'den beri İstanbul'un en lezzetli köftelerini sunuyoruz. Geleneksel Türk mutfağının en iyi örneklerini deneyimleyin.",
                Address = "Sultanahmet Mah. Divan Yolu Cad. No:12, Fatih/İstanbul",
                PhoneNumber = "+90 212 555 1234",
                Email = "info@sultanahmetkoftecisi.com",
                Website = "www.sultanahmetkoftecisi.com",
                OwnerId = owner.Id,
                Rate = 4.5m,
                ImageUrl = "/turkish-restaurant.jpg",
                Category = RestaurantCategory.Turkish, // Turkish
                Latitude = 41.0082,
                Longitude = 28.9784,
                CreatedAt = DateTime.UtcNow.AddMonths(-6),
                IsDeleted = false
            };
            context.Restaurants.Add(restaurant);

            // Çalışanlar (5 kişi)
            var employees = new List<AppUser>();
            for (int i = 0; i < 5; i++)
            {
                var employee = await CreateUser(userManager, $"employee{i + 1}@restaurant.com", "Employee123!", 
                    $"Employee{i + 1}", $"Çalışan {i + 1}", $"+90 555 222 000{i + 1}", 
                    $"İstanbul Adres {i + 1}", logger);
                employee.EmployerRestaurantId = restaurant.Id;
                await context.SaveChangesAsync();
                await userManager.AddToRoleAsync(employee, "Employee");
                employees.Add(employee);
            }

            // Kurye (3 kişi)
            var deliveryPersons = new List<AppUser>();
            for (int i = 0; i < 3; i++)
            {
                var delivery = await CreateUser(userManager, $"delivery{i + 1}@restaurant.com", "Delivery123!",
                    $"Delivery{i + 1}", $"Kurye {i + 1}", $"+90 555 333 000{i + 1}",
                    $"İstanbul Adres {i + 1}", logger);
                await userManager.AddToRoleAsync(delivery, "Delivery");
                deliveryPersons.Add(delivery);
            }

            // Müşteriler (20 kişi)
            var customers = new List<AppUser>();
            var customerNames = new[] { "Mehmet Demir", "Ayşe Kaya", "Fatma Şahin", "Ali Yıldız", "Zeynep Aydın",
                "Mustafa Öztürk", "Elif Aksoy", "Hasan Çelik", "Selin Erdoğan", "Emre Koç",
                "Merve Arslan", "Burak Şen", "Deniz Yavuz", "Can Öz", "Gizem Kurt",
                "Onur Polat", "Derya Çetin", "Serkan Güneş", "Esra Acar", "Oğuz Kılıç" };

            for (int i = 0; i < 20; i++)
            {
                var customer = await CreateUser(userManager, $"customer{i + 1}@test.com", "Customer123!",
                    $"Customer{i + 1}", customerNames[i], $"+90 555 444 00{i + 1:D2}",
                    $"Kadıköy Mah. Sokak No:{i + 1}, İstanbul", logger);
                await userManager.AddToRoleAsync(customer, "Customer");
                customers.Add(customer);
            }

            await context.SaveChangesAsync();

            // Menü oluştur
            var menu = new Menu
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Ana Menü",
                Description = "Sultanahmet Köftecisi'nin özel lezzetleri",
                RestaurantId = restaurant.Id, 
                CreatedAt = DateTime.UtcNow.AddMonths(-6)
            };
            context.Menus.Add(menu);
            await context.SaveChangesAsync();

            // Menü öğeleri (30+ çeşit)
            var menuItems = new List<MenuItem>
            {
                // Ana Yemekler
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Köfte (Porsiyon)", Description = "Izgara köfte, pilav, salata", Price = 85, Category = "Ana Yemek", MenuId = menu.Id, IsAvailable = true, ImageUrl = "/kofte.jpg" },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "İskender Kebap", Description = "Döner, yoğurt, tereyağı, domates sosu", Price = 120, Category = "Ana Yemek", MenuId = menu.Id, IsAvailable = true, ImageUrl = "/iskender.jpg" },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Adana Kebap", Description = "Acılı kıyma kebap, pilav, közlenmiş biber", Price = 110, Category = "Ana Yemek", MenuId = menu.Id, IsAvailable = true, ImageUrl = "/adana.jpg" },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Kuzu Tandır", Description = "Fırında pişmiş kuzu eti", Price = 150, Category = "Ana Yemek", MenuId = menu.Id, IsAvailable = true, ImageUrl = "/tandir.jpg" },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Patlıcan Kebap", Description = "Patlıcan, kıyma, salça", Price = 95, Category = "Ana Yemek", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Tavuk Şiş", Description = "Izgara tavuk göğüs, pilav", Price = 80, Category = "Ana Yemek", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Kanat (6 Adet)", Description = "Izgara tavuk kanat", Price = 70, Category = "Ana Yemek", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Beyti", Description = "Yoğurtlu beyti sarma", Price = 105, Category = "Ana Yemek", MenuId = menu.Id, IsAvailable = true },

                // Çorbalar
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Mercimek Çorbası", Description = "Günün çorbası", Price = 25, Category = "Çorba", MenuId = menu.Id, IsAvailable = true, ImageUrl = "/corba.jpg" },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Yayla Çorbası", Description = "Yoğurtlu çorba", Price = 28, Category = "Çorba", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Ezogelin Çorbası", Description = "Baharatlı bulgurlu çorba", Price = 27, Category = "Çorba", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Tavuk Suyu Çorbası", Description = "Şehriyeli tavuk çorbası", Price = 30, Category = "Çorba", MenuId = menu.Id, IsAvailable = true },

                // Mezeler
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Karışık Meze Tabağı", Description = "Haydari, acuka, cacık, tarator", Price = 65, Category = "Meze", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Humus", Description = "Nohut ezmesi", Price = 35, Category = "Meze", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Haydari", Description = "Yoğurt, sarımsak, dereotu", Price = 30, Category = "Meze", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Cacık", Description = "Yoğurt, salatalık, sarımsak", Price = 25, Category = "Meze", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Patlıcan Salatası", Description = "Közlenmiş patlıcan", Price = 40, Category = "Meze", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Atom", Description = "Acılı ezme", Price = 35, Category = "Meze", MenuId = menu.Id, IsAvailable = true },

                // Salatalar
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Çoban Salata", Description = "Domates, salatalık, soğan, biber", Price = 35, Category = "Salata", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Mevsim Salata", Description = "Yeşillikler, zeytinyağı, limon", Price = 40, Category = "Salata", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Gavurdağı Salata", Description = "Domates, ceviz, nar ekşisi", Price = 45, Category = "Salata", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Roka Salata", Description = "Roka, parmesan, zeytinyağı", Price = 50, Category = "Salata", MenuId = menu.Id, IsAvailable = true },

                // İçecekler
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Ayran", Description = "Ev yapımı ayran", Price = 15, Category = "İçecek", MenuId = menu.Id, IsAvailable = true, ImageUrl = "/ayran.jpg" },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Şalgam", Description = "Acılı/Acısız", Price = 18, Category = "İçecek", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Coca Cola", Description = "330ml", Price = 20, Category = "İçecek", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Fanta", Description = "330ml", Price = 20, Category = "İçecek", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Su", Description = "500ml", Price = 10, Category = "İçecek", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Soda", Description = "Meyveli/Sade", Price = 15, Category = "İçecek", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Türk Kahvesi", Description = "Geleneksel Türk kahvesi", Price = 25, Category = "İçecek", MenuId = menu.Id, IsAvailable = true, ImageUrl = "/kahve.jpg" },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Çay", Description = "Demleme çay", Price = 10, Category = "İçecek", MenuId = menu.Id, IsAvailable = true },

                // Tatlılar
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Sütlaç", Description = "Fırın sütlaç", Price = 40, Category = "Tatlı", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Künefe", Description = "Sıcak künefe", Price = 65, Category = "Tatlı", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Baklava", Description = "Antep fıstıklı baklava", Price = 70, Category = "Tatlı", MenuId = menu.Id, IsAvailable = true },
                new MenuItem { Id = Guid.NewGuid().ToString(), Name = "Kazandibi", Description = "Tavuk göğsü", Price = 45, Category = "Tatlı", MenuId = menu.Id, IsAvailable = true },
            };

            context.MenuItems.AddRange(menuItems);
            await context.SaveChangesAsync();

            // Masalar (15 masa)
            var tables = new List<Table>();
            for (int i = 1; i <= 15; i++)
            {
                tables.Add(new Table
                {
                    Id = Guid.NewGuid().ToString(),
                    TableNumber = i,
                    Capacity = i <= 5 ? 2 : (i <= 10 ? 4 : 6),
                    Location = i <= 5 ? TableLocation.IcMekan : (i <= 10 ? TableLocation.PencereKenari : TableLocation.Disari),
                    Status = TableStatus.Available,
                    RestaurantId = restaurant.Id,
                    CreatedAt = DateTime.UtcNow.AddMonths(-6)
                });
            }
            context.Tables.AddRange(tables);
            await context.SaveChangesAsync();

            // Siparişler (50+ sipariş - farklı durumlarda)
            var random = new Random();
            var orderStatuses = new[] { OrderStatus.Pending, OrderStatus.Confirmed, OrderStatus.Preparing, 
                OrderStatus.Ready, OrderStatus.OutForDelivery, OrderStatus.Delivered, OrderStatus.Completed, OrderStatus.Cancelled };
            var orderTypes = new[] { OrderType.DineIn, OrderType.TakeAway, OrderType.Delivery };

            for (int i = 0; i < 60; i++)
            {
                var customer = customers[random.Next(customers.Count)];
                var orderType = orderTypes[random.Next(orderTypes.Length)];
                var orderStatus = orderStatuses[random.Next(orderStatuses.Length)];
                var orderDate = DateTime.UtcNow.AddDays(-random.Next(30));

                var order = new Order
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = customer.Id,
                    RestaurantId = restaurant.Id,
                    TableId = orderType == OrderType.DineIn ? tables[random.Next(tables.Count)].Id : null,
                    OrderDate = orderDate,
                    Status = orderStatus,
                    Type = orderType,
                    PaymentMethod = random.Next(2) == 0 ? "Nakit" : "Kredi Kartı",
                    DeliveryAddress = orderType == OrderType.Delivery ? customer.Address : null,
                    SpecialRequests = i % 5 == 0 ? "Acısız olsun" : null,
                    CompletedAt = orderStatus == OrderStatus.Completed || orderStatus == OrderStatus.Delivered ? orderDate.AddMinutes(45) : null,
                    DeliveryPersonId = orderType == OrderType.Delivery && (orderStatus == OrderStatus.OutForDelivery || orderStatus == OrderStatus.Delivered) 
                        ? deliveryPersons[random.Next(deliveryPersons.Count)].Id : null,
                    CreatedAt = orderDate,
                    IsDeleted = false
                };

                // Sipariş öğeleri (2-5 arası)
                var itemCount = random.Next(2, 6);
                decimal totalAmount = 0;

                for (int j = 0; j < itemCount; j++)
                {
                    var menuItem = menuItems[random.Next(menuItems.Count)];
                    var quantity = random.Next(1, 4);

                    var orderItem = new OrderItem
                    {
                        Id = Guid.NewGuid().ToString(),
                        OrderId = order.Id,
                        MenuItemId = menuItem.Id,
                        Quantity = quantity,
                        UnitPrice = menuItem.Price,
                        Subtotal = menuItem.Price * quantity,
                        Notes = j == 0 && i % 7 == 0 ? "Az pişmiş olsun" : null,
                        CreatedAt = orderDate
                    };

                    totalAmount += orderItem.Subtotal;
                    order.OrderItems.Add(orderItem);
                }

                order.TotalAmount = totalAmount;
                context.Orders.Add(order);
            }

            await context.SaveChangesAsync();

            // Rezervasyonlar (40+ rezervasyon - geçmiş ve gelecek)
            var reservationStatuses = new[] { ReservationStatus.Pending, ReservationStatus.Confirmed, 
                ReservationStatus.Completed, ReservationStatus.Cancelled };

            for (int i = 0; i < 45; i++)
            {
                var customer = customers[random.Next(customers.Count)];
                var table = tables[random.Next(tables.Count)];
                var daysOffset = random.Next(-15, 15); // -15 gün öncesinden 15 gün sonrasına
                var reservationDate = DateTime.UtcNow.AddDays(daysOffset).Date.AddHours(random.Next(12, 22));
                var status = daysOffset < 0 ? (random.Next(2) == 0 ? ReservationStatus.Completed : ReservationStatus.Cancelled) : reservationStatuses[random.Next(2)];

                var reservation = new Reservation
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = customer.Id,
                    CustomerName = customer.FullName!,
                    CustomerPhone = customer.PhoneNumber!,
                    CustomerEmail = customer.Email!,
                    RestaurantId = restaurant.Id,
                    TableId = table.Id,
                    ReservationDate = reservationDate,
                    NumberOfGuests = random.Next(2, 7),
                    Status = status,
                    SpecialRequests = i % 6 == 0 ? "Pencere kenarı tercih ederiz" : null,
                    CreatedAt = reservationDate.AddDays(-random.Next(1, 7)),
                    IsDeleted = false
                };

                context.Reservations.Add(reservation);
            }

            await context.SaveChangesAsync();

            // Yorumlar (30+ yorum)
            var reviewStatuses = new[] { "Approved", "Pending", "Rejected" };
            var reviewComments = new[]
            {
                "Harika bir deneyimdi! Köfteler muhteşemdi.",
                "Çok lezzetli yemekler, kesinlikle tavsiye ederim.",
                "Servis biraz yavaştı ama yemekler harikaydı.",
                "Fiyat performans açısından çok iyi.",
                "İskender kebap efsaneydi, tekrar geleceğim.",
                "Meze çeşitleri çok güzeldi.",
                "Personel çok ilgili ve güleryüzlü.",
                "Ambiyans çok güzel, aile ile gelmeye uygun.",
                "Porsiyonlar doyurucuydu.",
                "Türk mutfağının en güzel örnekleri burada.",
                "Biraz gürültülüydü ama yemekler harikaydı.",
                "Temizlik ve hijyen konusunda çok başarılılar.",
                "Adana kebap müthişti.",
                "Ayran gerçekten ev yapımı ve çok lezzetliydi.",
                "Künefe sıcak sıcak geldi, tam kıvamındaydı.",
            };

            for (int i = 0; i < 35; i++)
            {
                var customer = customers[random.Next(customers.Count)];
                var rating = random.Next(3, 6);

                var review = new Review
                {
                    Id = Guid.NewGuid().ToString(),
                    RestaurantId = restaurant.Id,
                    CustomerId = customer.Id,
                    Customer=customer,
                    Rating = rating,
                    Comment = reviewComments[random.Next(reviewComments.Length)],
                    Status = reviewStatuses[random.Next(reviewStatuses.Length)],
                    AdminNote = i % 4 == 0 ? "Geri bildiriminiz için teşekkür ederiz!" : null,
                    CreatedAt = DateTime.UtcNow.AddDays(-random.Next(60)),
                    IsDeleted = false
                };

                context.Reviews.Add(review);
            }

            await context.SaveChangesAsync();

            // İş ilanları (5 ilan)
            var jobPostings = new List<JobPosting>
            {
                new JobPosting
                {
                    Id = Guid.NewGuid().ToString(),
                    RestaurantId = restaurant.Id,
                    Title = "Aşçı Aranıyor",
                    Description = "Deneyimli aşçı aranıyor. Türk mutfağı deneyimi şart.",
                    Requirements = "- En az 2 yıl deneyim\n- Temiz ve düzenli çalışma\n- Takım çalışmasına yatkın",
                    Position = "Aşçı",
                    Salary = 17500,
                    EmploymentType = "Full-time",
                    PostedDate = DateTime.UtcNow.AddDays(-15),
                    ExpiryDate = DateTime.UtcNow.AddMonths(1),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-15)
                },
                new JobPosting
                {
                    Id = Guid.NewGuid().ToString(),
                    RestaurantId = restaurant.Id,
                    Title = "Garson/Garson Aranıyor",
                    Description = "Müşteri odaklı, dinamik garson/garson aranıyor.",
                    Requirements = "- İyi iletişim becerileri\n- Güleryüzlü ve müşteri odaklı\n- Deneyim şart değil",
                    Position = "Garson",
                    Salary = 13500,
                    EmploymentType = "Full-time",
                    PostedDate = DateTime.UtcNow.AddDays(-10),
                    ExpiryDate = DateTime.UtcNow.AddMonths(1),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new JobPosting
                {
                    Id = Guid.NewGuid().ToString(),
                    RestaurantId = restaurant.Id,
                    Title = "Komi Aranıyor",
                    Description = "Mutfakta yardımcı olacak komi aranıyor.",
                    Requirements = "- Temiz ve düzenli çalışma\n- Hızlı öğrenme yeteneği",
                    Position = "Komi",
                    Salary = 12000,
                    EmploymentType = "Full-time",
                    PostedDate = DateTime.UtcNow.AddDays(-5),
                    ExpiryDate = DateTime.UtcNow.AddMonths(1),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new JobPosting
                {
                    Id = Guid.NewGuid().ToString(),
                    RestaurantId = restaurant.Id,
                    Title = "Kasa Görevlisi",
                    Description = "Kasa işlemlerini yürütecek görevli aranıyor.",
                    Requirements = "- Dikkatli ve sorumlu\n- Temel matematik bilgisi\n- Bilgisayar kullanımı",
                    Position = "Kasa Görevlisi",
                    Salary = 14500,
                    EmploymentType = "Full-time",
                    PostedDate = DateTime.UtcNow.AddDays(-3),
                    ExpiryDate = DateTime.UtcNow.AddMonths(1),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-3)
                },
                new JobPosting
                {
                    Id = Guid.NewGuid().ToString(),
                    RestaurantId = restaurant.Id,
                    Title = "Kurye Aranıyor",
                    Description = "Paket servis için kurye aranıyor.",
                    Requirements = "- Motorlu araç sahibi\n- Şehri iyi bilmek\n- Ehliyet sahibi",
                    Position = "Kurye",
                    Salary = 16000,
                    EmploymentType = "Full-time",
                    PostedDate = DateTime.UtcNow.AddDays(-30),
                    ExpiryDate = DateTime.UtcNow.AddDays(-5),
                    IsActive = false,
                    CreatedAt = DateTime.UtcNow.AddDays(-30)
                }
            };

            context.JobPostings.AddRange(jobPostings);
            await context.SaveChangesAsync();

            // İş başvuruları (15+ başvuru)
            var applicationStatuses = new[] { "Pending", "Reviewed", "Accepted", "Rejected" };

            for (int i = 0; i < 15; i++)
            {
                var customer = customers[random.Next(customers.Count)];
                var jobPosting = jobPostings[random.Next(Math.Min(4, jobPostings.Count))]; // Sadece aktif ilanlara

                var application = new JobApplication
                {
                    Id = Guid.NewGuid().ToString(),
                    JobPostingId = jobPosting.Id,
                    ApplicantId = customer.Id,
                    CoverLetter = $"Merhaba, {jobPosting.Title} pozisyonu için başvuru yapmak istiyorum. Bu alanda {random.Next(1, 6)} yıl deneyimim var.",
                    Status = applicationStatuses[random.Next(applicationStatuses.Length)],
                    ApplicationDate = DateTime.UtcNow.AddDays(-random.Next(20)),
                    ReviewedDate = i % 3 == 0 ? DateTime.UtcNow.AddDays(-random.Next(10)) : null,
                    ReviewNotes = i % 3 == 0 ? "Görüşmeye çağırıldı" : null,
                    CreatedAt = DateTime.UtcNow.AddDays(-random.Next(20))
                };

                context.JobApplications.Add(application);
            }

            await context.SaveChangesAsync();

            logger.LogInformation("✅ Seed data başarıyla oluşturuldu!");
            logger.LogInformation($"📊 Oluşturulan veriler:");
            logger.LogInformation($"   - 1 Restoran");
            logger.LogInformation($"   - {customers.Count} Müşteri");
            logger.LogInformation($"   - {employees.Count} Çalışan");
            logger.LogInformation($"   - {deliveryPersons.Count} Kurye");
            logger.LogInformation($"   - {menuItems.Count} Menü Öğesi");
            logger.LogInformation($"   - {tables.Count} Masa");
            logger.LogInformation($"   - 60 Sipariş");
            logger.LogInformation($"   - 45 Rezervasyon");
            logger.LogInformation($"   - 35 Yorum");
            logger.LogInformation($"   - {jobPostings.Count} İş İlanı");
            logger.LogInformation($"   - 15 İş Başvurusu");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "❌ Seed data oluşturulurken hata oluştu.");
            throw;
        }
    }

    private static async Task CreateRoles(RoleManager<IdentityRole> roleManager, ILogger logger)
    {
        string[] roleNames = { "Admin", "RestaurantOwner", "Employee", "Customer", "Delivery" };
        foreach (var roleName in roleNames)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
                logger.LogInformation($"✅ {roleName} rolü oluşturuldu.");
            }
        }
    }

    private static async Task<AppUser> CreateUser(UserManager<AppUser> userManager, string email, string password,
        string userName, string fullName, string phone, string address, ILogger logger)
    {
        var existingUser = await userManager.FindByEmailAsync(email);
        if (existingUser != null)
        {
            return existingUser;
        }

        var user = new AppUser
        {
            UserName = userName,
            Email = email,
            FullName = fullName,
            PhoneNumber = phone,
            Address = address,
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, password);
        if (result.Succeeded)
        {
            logger.LogInformation($"✅ Kullanıcı oluşturuldu: {email}");
            return user;
        }

        logger.LogError($"❌ Kullanıcı oluşturulamadı: {email} - {string.Join(", ", result.Errors.Select(e => e.Description))}");
        throw new Exception($"User creation failed: {string.Join(", ", result.Errors.Select(e => e.Description))}");
    }
}
