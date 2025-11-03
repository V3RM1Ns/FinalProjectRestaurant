# Test Kullanıcıları

## Restoran Sahibi (Owner)
- **Email:** owner@gmail.com
- **Şifre:** Owner123!
- **Rol:** RestaurantOwner
- **Yönlendirilecek Sayfa:** /owner/dashboard
- **Restoranları:** 
  - Lezzet Durağı (Türk Mutfağı)
  - Pizza Palace (İtalyan Mutfağı)
  - Sushi Tokyo (Japon Mutfağı)
  - Burger House (Fast Food)
  - Vejetaryen Köşe (Vejetaryen/Vegan)

## Admin
- **Email:** admin@gmail.com
- **Şifre:** Admin123!
- **Rol:** Admin
- **Yönlendirilecek Sayfa:** /admin/dashboard

## Müşteriler
- **Email:** customer1@gmail.com - customer5@gmail.com
- **Şifre:** Customer1-5 + 23!
- **Rol:** Customer
- **Yönlendirilecek Sayfa:** /customer

## Çalışanlar
- **Email:** employee1@gmail.com - employee3@gmail.com
- **Şifre:** Employee1-3 + 23!
- **Rol:** Employee
- **Yönlendirilecek Sayfa:** /employee/dashboard

## Teslimat Görevlisi
- **Email:** delivery@gmail.com
- **Şifre:** Delivery123!
- **Rol:** Delivery
- **Yönlendirilecek Sayfa:** /delivery/orders

---

## Owner Dashboard Özellikleri

Owner olarak giriş yaptığınızda aşağıdaki sayfaları kullanabilirsiniz:

### 1. Dashboard (/owner/dashboard)
- Restoran seçimi
- Toplam gelir, günlük gelir
- Sipariş sayıları
- Aktif rezervasyonlar
- En çok satan ürünler
- Son siparişler

### 2. Menü Yönetimi (/owner/menu)
- Menü oluşturma, güncelleme, silme
- Menü öğeleri ekleme/düzenleme
- Fiyat ve stok yönetimi

### 3. Çalışan Yönetimi (/owner/employees)
- Çalışan ekleme/düzenleme/silme
- Çalışan listesi
- Çalışan sayısı

### 4. Sipariş Yönetimi (/owner/orders)
- Tüm siparişler
- Sipariş durumu güncelleme
- Sipariş detayları

### 5. Rezervasyon Yönetimi (/owner/reservations)
- Rezervasyon listesi
- Rezervasyon onaylama/reddetme
- Günlük rezervasyonlar

### 6. Değerlendirmeler (/owner/reviews)
- Müşteri yorumları
- Onay bekleyen yorumlar
- Yorumlara cevap verme
- Ortalama puan

### 7. İş Başvuruları (/owner/applications)
- İş ilanı başvuruları
- Başvuru kabul/red
- Bekleyen başvurular

### 8. Raporlar (/owner/reports)
- Satış raporları
- Kategori bazlı satışlar
- Tarih aralığına göre raporlama
- En çok satan ürünler

---

## API Endpoint'leri (Owner Controller)

Tüm endpoint'ler `/api/Owner` prefix'i ile başlar ve `RestaurantOwner` rolü gerektirir:

### Restaurant Management
- GET /api/Owner/restaurants
- GET /api/Owner/restaurants/{id}
- POST /api/Owner/restaurants
- PUT /api/Owner/restaurants/{id}
- DELETE /api/Owner/restaurants/{id}

### Dashboard & Statistics
- GET /api/Owner/restaurants/{id}/dashboard
- GET /api/Owner/restaurants/{id}/statistics
- GET /api/Owner/restaurants/{id}/top-selling-items
- GET /api/Owner/restaurants/{id}/revenue-chart
- GET /api/Owner/restaurants/{id}/total-revenue
- GET /api/Owner/restaurants/{id}/today-revenue

### Reports
- GET /api/Owner/restaurants/{id}/sales-report
- GET /api/Owner/restaurants/{id}/orders-by-date-range
- GET /api/Owner/restaurants/{id}/category-sales

### Employee Management
- GET /api/Owner/restaurants/{id}/employees
- POST /api/Owner/restaurants/{id}/employees
- PUT /api/Owner/restaurants/{id}/employees/{employeeId}
- DELETE /api/Owner/restaurants/{id}/employees/{employeeId}

### Job Applications
- GET /api/Owner/restaurants/{id}/job-applications
- GET /api/Owner/restaurants/{id}/job-applications/pending
- POST /api/Owner/job-applications/{id}/accept
- POST /api/Owner/job-applications/{id}/reject

### Reviews
- GET /api/Owner/restaurants/{id}/reviews
- GET /api/Owner/restaurants/{id}/reviews/pending
- POST /api/Owner/reviews/{id}/approve
- POST /api/Owner/reviews/{id}/reject
- POST /api/Owner/reviews/{id}/respond

### Orders
- GET /api/Owner/restaurants/{id}/orders
- GET /api/Owner/restaurants/{id}/orders/status/{status}
- PUT /api/Owner/orders/{id}/status

### Reservations
- GET /api/Owner/restaurants/{id}/reservations
- GET /api/Owner/restaurants/{id}/reservations/status/{status}
- PUT /api/Owner/reservations/{id}/status

### Menu & Menu Items
- GET /api/Owner/restaurants/{id}/menus
- POST /api/Owner/restaurants/{id}/menus
- PUT /api/Owner/menus/{id}
- DELETE /api/Owner/menus/{id}
- GET /api/Owner/menus/{id}/items
- POST /api/Owner/menus/{id}/items
- PUT /api/Owner/menu-items/{id}
- DELETE /api/Owner/menu-items/{id}

### Tables
- GET /api/Owner/restaurants/{id}/tables
- POST /api/Owner/restaurants/{id}/tables
- PUT /api/Owner/tables/{id}
- DELETE /api/Owner/tables/{id}

---

## Seed Data İçeriği

Her restoran için otomatik oluşturulan veriler:
- ✅ 10 Masa (6 iç mekan, 4 dış mekan)
- ✅ 30 Sipariş (farklı durumlar ve tarihler)
- ✅ 15 Rezervasyon (geçmiş ve gelecek)
- ✅ 20 Değerlendirme (çoğu onaylı)
- ✅ 2 İş İlanı + Başvurular
- ✅ 5-7 Menü Öğesi (restorana özel)

---

## Sistemi Çalıştırma

### Backend
```bash
cd Src/Presentation/RestaurantManagment.WebAPI
dotnet run
```
Backend: http://localhost:5000
Swagger: http://localhost:5000/swagger

### Frontend
```bash
cd FrontEnd/Restoran
npm install  # İlk kez çalıştırıyorsanız
npm run dev
```
Frontend: http://localhost:3000

### Test Adımları
1. Frontend'i başlatın
2. http://localhost:3000/login sayfasına gidin
3. owner@gmail.com / Owner123! ile giriş yapın
4. Otomatik olarak /owner/dashboard sayfasına yönlendirileceksiniz
5. 5 farklı restoranınız olacak, seçip yönetebilirsiniz

---

## Notlar
- Tüm seed data, uygulama ilk çalıştığında otomatik oluşturulur
- RestaurantOwner rolündeki kullanıcılar login sonrası otomatik olarak owner dashboard'a yönlendirilir
- Frontend'teki tüm owner sayfalarında "use client" direktifi doğru şekilde kullanılmıştır
- Tüm API endpoint'leri için frontend fonksiyonları hazır (owner-api.ts)

