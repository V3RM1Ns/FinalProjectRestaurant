# Customer Frontend - Kullanım Kılavuzu

Bu dokümantasyon, müşteri panelindeki tüm özellikleri ve endpoint'leri nasıl kullanacağınızı açıklar.

## 📁 Oluşturulan Dosyalar

### 1. **API Servisi**
- `lib/customer-api.ts` - Tüm Customer endpoint'lerini içeren API servisi

### 2. **Sayfalar**
- `app/customer/dashboard/page.tsx` - Ana dashboard sayfası
- `app/customer/orders/page.tsx` - Siparişler sayfası
- `app/customer/reservations/page.tsx` - Rezervasyonlar sayfası
- `app/customer/favorites/page.tsx` - Favori restoranlar sayfası
- `app/customer/loyalty/page.tsx` - Sadakat programı ve ödüller
- `app/customer/reviews/page.tsx` - Yorumlar sayfası
- `app/customer/profile/page.tsx` - Profil ve istatistikler

## 🎯 Özellikler

### 1. Dashboard (Ana Sayfa)
**Sayfa:** `/customer/dashboard`

**Özellikler:**
- Genel istatistikler (toplam sipariş, rezervasyon, harcama, favori sayısı)
- Aktif siparişler listesi
- Yaklaşan rezervasyonlar
- Önerilen restoranlar
- Hızlı aksiyonlar (Yeni sipariş, rezervasyon, favoriler)

**Kullanılan API'ler:**
```typescript
customerApi.statistics.get()
customerApi.statistics.getRecommendations(6)
customerApi.orders.getActive()
customerApi.reservations.getUpcoming()
```

### 2. Siparişler
**Sayfa:** `/customer/orders`

**Özellikler:**
- Aktif siparişler (Beklemede, Hazırlanıyor, vb.)
- Sipariş geçmişi
- Sipariş detayları
- Sipariş iptal etme
- Sipariş durumu takibi

**Kullanılan API'ler:**
```typescript
// Aktif siparişleri getir
customerApi.orders.getActive()

// Sipariş geçmişini getir
customerApi.orders.getHistory()

// Sipariş iptal et
customerApi.orders.cancel(orderId)

// Siparişi güncelle
customerApi.orders.update(orderId, updateData)
```

### 3. Rezervasyonlar
**Sayfa:** `/customer/reservations`

**Özellikler:**
- Yaklaşan rezervasyonlar
- Geçmiş rezervasyonlar
- Rezervasyon detayları
- Rezervasyon iptal/düzenleme
- Müsait masa kontrolü

**Kullanılan API'ler:**
```typescript
// Yaklaşan rezervasyonlar
customerApi.reservations.getUpcoming()

// Geçmiş rezervasyonlar
customerApi.reservations.getPast()

// Rezervasyon iptal
customerApi.reservations.cancel(reservationId)

// Müsait masaları getir
customerApi.reservations.getAvailableTables(restaurantId, date, partySize)
```

### 4. Favori Restoranlar
**Sayfa:** `/customer/favorites`

**Özellikler:**
- Favori restoranlar listesi
- Favorilere ekleme/çıkarma
- Restoran detayları
- Hızlı sipariş verme

**Kullanılan API'ler:**
```typescript
// Tüm favorileri getir
customerApi.favorites.getAll()

// Favoriye ekle
customerApi.favorites.add(restaurantId)

// Favoriden çıkar
customerApi.favorites.remove(restaurantId)

// Favori mi kontrol et
customerApi.favorites.check(restaurantId)
```

### 5. Sadakat Programı & Ödüller
**Sayfa:** `/customer/loyalty`

**Özellikler:**
- Restoran bazlı puan görüntüleme
- Mevcut ödüller listesi
- Ödül kullanma
- Puan geçmişi
- İlerleme çubukları

**Kullanılan API'ler:**
```typescript
// Restoran puanlarını getir
customerApi.loyalty.getPoints(restaurantId)

// Mevcut ödülleri getir
customerApi.loyalty.getRewards(restaurantId)

// Ödül kullan
customerApi.loyalty.redeemReward(rewardId)
```

### 6. Yorumlar
**Sayfa:** `/customer/reviews`

**Özellikler:**
- Yapılan yorumlar listesi
- Yorum düzenleme
- Yorum silme
- Restoran yanıtlarını görüntüleme
- Yıldız puanlama sistemi

**Kullanılan API'ler:**
```typescript
// Yorumlarımı getir
customerApi.reviews.getMyReviews(pageNumber, pageSize)

// Yorum oluştur
customerApi.reviews.create({
  restaurantId,
  orderId,
  rating,
  comment
})

// Yorum güncelle
customerApi.reviews.update(reviewId, { rating, comment })

// Yorum sil
customerApi.reviews.delete(reviewId)
```

### 7. Profil & İstatistikler
**Sayfa:** `/customer/profile`

**Özellikler:**
- Detaylı istatistikler
- Toplam harcama
- Sipariş/rezervasyon sayıları
- Favori mutfak türü
- En çok sipariş verilen restoran
- Başarım rozetleri
- Aktivite özeti (son 30 gün)

**Kullanılan API'ler:**
```typescript
// İstatistikleri getir
customerApi.statistics.get()

// Toplam harcama
customerApi.statistics.getTotalSpent()

// Toplam sipariş sayısı
customerApi.statistics.getTotalOrders()

// Toplam rezervasyon sayısı
customerApi.statistics.getTotalReservations()
```

## 🔧 API Kullanımı

### Basit Kullanım (customerApi objesi)
```typescript
import { customerApi } from '@/lib/customer-api'

// Restoranları getir
const restaurants = await customerApi.restaurants.getAll(1, 10)

// Restoran detayı
const restaurant = await customerApi.restaurants.getById(restaurantId)

// Sipariş oluştur
const order = await customerApi.orders.create({
  restaurantId: "xxx",
  orderType: "Delivery",
  items: [
    { menuItemId: "yyy", quantity: 2 }
  ]
})
```

### Class-Based Kullanım (CustomerApi)
```typescript
import { CustomerApi } from '@/lib/customer-api'

// Restoranları getir
const restaurants = await CustomerApi.getRestaurants(1, 10)

// Sipariş oluştur
const order = await CustomerApi.createOrder({
  restaurantId: "xxx",
  orderType: "Delivery",
  items: [
    { menuItemId: "yyy", quantity: 2 }
  ]
})
```

## 📊 Tüm Endpoint'ler

### Restaurant Operations (7 endpoint)
- `GET /api/Customer/restaurants` - Restoran listesi (pagination)
- `GET /api/Customer/restaurants/{id}` - Restoran detayı
- `GET /api/Customer/restaurants/search?searchTerm=` - Restoran arama
- `GET /api/Customer/restaurants/category/{category}` - Kategoriye göre
- `GET /api/Customer/restaurants/nearby?lat=&lng=&radius=` - Yakındaki restoranlar
- `GET /api/Customer/restaurants/top-rated?count=` - En yüksek puanlı
- `GET /api/Customer/restaurants/{id}/average-rating` - Ortalama puan

### Menu Operations (6 endpoint)
- `GET /api/Customer/restaurants/{id}/menus` - Restoran menüleri
- `GET /api/Customer/menus/{id}` - Menü detayı
- `GET /api/Customer/menus/{id}/items` - Menü ürünleri
- `GET /api/Customer/menu-items/{id}` - Ürün detayı
- `GET /api/Customer/restaurants/{id}/available-items` - Mevcut ürünler
- `GET /api/Customer/restaurants/{id}/menu-items/search` - Ürün arama

### Order Operations (9 endpoint)
- `GET /api/Customer/orders` - Siparişlerim
- `GET /api/Customer/orders/{id}` - Sipariş detayı
- `POST /api/Customer/orders` - Sipariş oluştur
- `PUT /api/Customer/orders/{id}` - Sipariş güncelle
- `POST /api/Customer/orders/{id}/cancel` - Sipariş iptal
- `GET /api/Customer/orders/active` - Aktif siparişler
- `GET /api/Customer/orders/history` - Sipariş geçmişi
- `GET /api/Customer/orders/current` - Mevcut sipariş
- `GET /api/Customer/orders/count` - Sipariş sayısı

### Reservation Operations (10 endpoint)
- `GET /api/Customer/reservations` - Rezervasyonlarım
- `GET /api/Customer/reservations/{id}` - Rezervasyon detayı
- `POST /api/Customer/reservations` - Rezervasyon oluştur
- `PUT /api/Customer/reservations/{id}` - Rezervasyon güncelle
- `POST /api/Customer/reservations/{id}/cancel` - Rezervasyon iptal
- `GET /api/Customer/reservations/upcoming` - Yaklaşan
- `GET /api/Customer/reservations/past` - Geçmiş
- `GET /api/Customer/restaurants/{id}/available-tables` - Müsait masalar
- `GET /api/Customer/tables/{id}/availability` - Masa müsaitlik

### Review Operations (9 endpoint)
- `GET /api/Customer/restaurants/{id}/reviews` - Restoran yorumları
- `GET /api/Customer/reviews` - Yorumlarım
- `GET /api/Customer/reviews/{id}` - Yorum detayı
- `POST /api/Customer/reviews` - Yorum oluştur
- `PUT /api/Customer/reviews/{id}` - Yorum güncelle
- `DELETE /api/Customer/reviews/{id}` - Yorum sil
- `GET /api/Customer/restaurants/{id}/can-review` - Yorum yapabilir mi
- `GET /api/Customer/restaurants/{id}/my-review` - Restorana yorumum
- `GET /api/Customer/restaurants/{id}/average-rating` - Ortalama puan

### Favorites Operations (4 endpoint)
- `GET /api/Customer/favorites` - Favorilerim
- `POST /api/Customer/favorites/{id}` - Favoriye ekle
- `DELETE /api/Customer/favorites/{id}` - Favoriden çıkar
- `GET /api/Customer/favorites/{id}/check` - Favori mi kontrol

### Statistics Operations (5 endpoint)
- `GET /api/Customer/statistics` - İstatistikler
- `GET /api/Customer/recommendations` - Önerilen restoranlar
- `GET /api/Customer/total-spent` - Toplam harcama
- `GET /api/Customer/total-orders` - Toplam sipariş
- `GET /api/Customer/total-reservations` - Toplam rezervasyon

### Loyalty Operations (3 endpoint)
- `GET /api/Customer/loyalty/{restaurantId}/points` - Loyalty puanları
- `GET /api/Customer/loyalty/{restaurantId}/rewards` - Mevcut ödüller
- `POST /api/Customer/loyalty/rewards/{id}/redeem` - Ödül kullan

## 🚀 Kullanmaya Başlama

1. **Gerekli component'leri import edin:**
```typescript
import { customerApi } from '@/lib/customer-api'
import { useToast } from '@/hooks/use-toast'
```

2. **API çağrısı yapın:**
```typescript
const loadData = async () => {
  try {
    const data = await customerApi.restaurants.getAll(1, 10)
    setRestaurants(data.items)
  } catch (error) {
    toast({
      title: 'Hata',
      description: 'Veri yüklenirken bir hata oluştu',
      variant: 'destructive'
    })
  }
}
```

3. **Sayfaları kullanın:**
- Dashboard: `http://localhost:3000/customer/dashboard`
- Siparişler: `http://localhost:3000/customer/orders`
- Rezervasyonlar: `http://localhost:3000/customer/reservations`
- Favoriler: `http://localhost:3000/customer/favorites`
- Loyalty: `http://localhost:3000/customer/loyalty`
- Yorumlar: `http://localhost:3000/customer/reviews`
- Profil: `http://localhost:3000/customer/profile`

## 📝 Notlar

- Tüm API çağrıları authentication gerektirir (JWT token)
- Pagination destekleyen endpoint'ler varsayılan olarak sayfa 1, sayfa başına 10 kayıt getirir
- Toast notification'ları hata ve başarı mesajları için kullanılır
- Tüm tarih ve saat değerleri ISO 8601 formatında gönderilir

## 🎨 UI Bileşenleri

Kullanılan shadcn/ui bileşenleri:
- Card, CardHeader, CardContent, CardTitle, CardDescription
- Button
- Badge
- Tabs, TabsList, TabsTrigger, TabsContent
- Dialog
- Progress
- Textarea
- Label

Tüm bileşenler responsive tasarıma sahiptir ve mobil cihazlarda da sorunsuz çalışır.

## ✅ Tamamlanan Özellikler

✅ Tam API entegrasyonu (53 endpoint)
✅ Dashboard sayfası
✅ Sipariş yönetimi (görüntüleme, iptal)
✅ Rezervasyon yönetimi (oluşturma, iptal, düzenleme)
✅ Favori restoranlar yönetimi
✅ Sadakat programı ve ödül sistemi
✅ Yorum yapma ve yönetme
✅ Detaylı profil ve istatistikler
✅ Başarım rozetleri
✅ Responsive tasarım
✅ Loading states
✅ Error handling
✅ Toast notifications

Başarıyla tüm müşteri özellikleri frontend'e entegre edildi! 🎉

