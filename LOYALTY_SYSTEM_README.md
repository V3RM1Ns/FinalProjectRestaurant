ara açıklama ekleyebilir
- Kullanım sayısı sınırı belirleyebilir
- Son kullanma tarihi ayarlayabilir
- Oluşturulan tüm kodları görüntüleyebilir ve devre dışı bırakabilir

**Endpoint:** `/admin/loyalty`

#### 2. **Owner (Restoran Sahibi)** - Ödül Yönetimi
- Restoranı için ödüller (rewards) oluşturabilir
- Ödül için gerekli puan miktarını belirleyebilir
- İndirim tutarı veya yüzdesi ekleyebilir
- Ödülleri düzenleyebilir ve silebilir
- Maksimum kullanım sayısı ayarlayabilir

**Endpoint:** `/owner/rewards`

#### 3. **Customer (Müşteri)** - Puan Kullanma
- Admin tarafından oluşturulan kodları kullanarak puan kazanabilir
- Restoran bazında puan bakiyesini görüntüleyebilir
- Puanlarını ödüllerle değiştirebilir
- Kupon kodları alabilir ve kullanabilir
- Geçmiş işlemlerini görebilir

**Endpoint:** `/customer/loyalty`

---

## 📋 API Endpoints

### Admin Endpoints
```
POST   /api/Loyalty/admin/codes                    - Yeni kod oluştur
GET    /api/Loyalty/admin/codes                    - Tüm kodları listele
GET    /api/Loyalty/admin/codes/{codeId}           - Kod detayı
PATCH  /api/Loyalty/admin/codes/{codeId}/deactivate - Kodu devre dışı bırak
```

### Owner Endpoints
```
POST   /api/Loyalty/owner/rewards                  - Yeni ödül oluştur
PUT    /api/Loyalty/owner/rewards/{rewardId}       - Ödül güncelle
DELETE /api/Loyalty/owner/rewards/{rewardId}       - Ödül sil
```

### Customer Endpoints
```
POST   /api/Loyalty/customer/redeem-code           - Kod kullan
GET    /api/Loyalty/customer/balance               - Puan bakiyesi
GET    /api/Loyalty/customer/history               - İşlem geçmişi
POST   /api/Loyalty/customer/redeem-reward         - Ödül kullan
GET    /api/Loyalty/customer/redemptions           - Kuponlarım
```

### Public Endpoints
```
GET    /api/Loyalty/restaurants/{restaurantId}/rewards - Restoran ödülleri
GET    /api/Loyalty/rewards/{rewardId}                 - Ödül detayı
```

---

## 🚀 Kullanım Senaryoları

### Senaryo 1: Admin Kod Oluşturur
1. Admin `/admin/loyalty` sayfasına gider
2. Puan değerini seçer (örn: 1000 puan)
3. İsteğe bağlı açıklama ekler ("Yeni Yıl Bonusu")
4. "Generate Code" butonuna tıklar
5. Sistem benzersiz bir kod üretir (örn: `LP-A1B2C3D4`)
6. Admin bu kodu müşterilerle paylaşır

### Senaryo 2: Müşteri Kod Kullanır
1. Customer `/customer/loyalty` sayfasına gider
2. "Redeem Code" butonuna tıklar
3. Aldığı kodu girer (`LP-A1B2C3D4`)
4. Sistem puanları hesabına ekler
5. Bakiye güncellenir

### Senaryo 3: Owner Ödül Oluşturur
1. Owner `/owner/rewards` sayfasına gider
2. "Create Reward" butonuna tıklar
3. Ödül bilgilerini girer:
   - İsim: "Ücretsiz Tatlı"
   - Açıklama: "Herhangi bir tatlı ücretsiz"
   - Gerekli Puan: 500
   - İndirim: $10 veya %20
4. "Create" butonuna tıklar

### Senaryo 4: Müşteri Ödül Kullanır
1. Customer restoran sayfasındaki "Rewards" sekmesine gider
2. Mevcut ödülleri görür
3. Yeterli puanı olan ödülü seçer
4. "Redeem Now" butonuna tıklar
5. Sistem bir kupon kodu üretir (örn: `CPT-XYZ123ABC`)
6. Müşteri bu kodu restoranda kullanır

---

## 💻 Database Modelleri

### LoyaltyCode (Admin tarafından oluşturulur)
- `Code`: Benzersiz kod (LP-XXXXXXXX)
- `PointValue`: Puan değeri (200-5000 arası)
- `MaxUses`: Maksimum kullanım sayısı
- `ExpiryDate`: Son kullanma tarihi
- `IsActive`: Aktif/pasif durum

### Reward (Owner tarafından oluşturulur)
- `Name`: Ödül adı
- `PointsRequired`: Gerekli puan miktarı
- `DiscountAmount`: İndirim tutarı ($)
- `DiscountPercentage`: İndirim yüzdesi (%)
- `MaxRedemptions`: Maksimum kullanım

### LoyaltyPoint (Otomatik oluşturulur)
- `Points`: Puan miktarı (+/-)
- `Type`: Earned, Bonus, Redeemed, Expired
- `CustomerId`: Müşteri ID
- `RestaurantId`: Restoran ID

### RewardRedemption (Müşteri ödül kullanınca)
- `CouponCode`: Kupon kodu
- `PointsSpent`: Harcanan puan
- `IsUsed`: Kullanıldı mı
- `ExpiryDate`: Kupon son kullanma

---

## 🔧 Kurulum ve Migration

### 1. Database Migration Çalıştır
```bash
cd Src/Infrastructure/RestaurantManagment.Persistance
dotnet ef database update --startup-project ../../Presentation/RestaurantManagment.WebAPI
```

### 2. Backend Çalıştır
```bash
cd Src/Presentation/RestaurantManagment.WebAPI
dotnet run
```

### 3. Frontend Çalıştır
```bash
cd FrontEnd/Restoran
npm install
npm run dev
```

---

## 📊 Örnek Puan Değerleri

Farklı kampanyalar için önerilen puan değerleri:

- **200 puan**: Küçük promosyonlar, günlük kampanyalar
- **500 puan**: Haftalık özel teklifler
- **1000 puan**: Aylık kampanyalar
- **2000 puan**: Özel günler (yılbaşı, bayram)
- **5000 puan**: VIP müşteriler, yıllık etkinlikler

---

## ✨ Özellikler

✅ Admin sadece puan kodu oluşturabilir
✅ Owner sadece ödülleri yönetebilir  
✅ Customer sadece kullanabilir (kod ve ödül)
✅ Her kod farklı puan değerine sahip
✅ Restoran bazında puan takibi
✅ Kupon kodları ile ödül sistemi
✅ Son kullanma tarihi kontrolü
✅ Maksimum kullanım limiti
✅ Real-time bakiye güncelleme
✅ İşlem geçmişi

---

## 🎯 Frontend Sayfaları

- `/admin/loyalty` - Admin kod yönetimi
- `/owner/rewards` - Owner ödül yönetimi
- `/customer/loyalty` - Müşteri puan bakiyesi ve kuponlar
- `/restaurants/[id]/rewards` - Restoran ödülleri (public)

---

## 🔐 Güvenlik

- Tüm endpoint'ler JWT authentication ile korunmuştur
- Her role özel authorization kontrolleri vardır
- Admin sadece kod oluşturabilir
- Owner sadece kendi restoranının ödüllerini yönetebilir
- Customer sadece kendi puanlarını kullanabilir

---

## 📝 Notlar

- Kodlar büyük harfli ve benzersizdir (LP-XXXXXXXX formatında)
- Kupon kodları CPT-XXXXXXXXXX formatındadır
- Puanlar restoran bazında takip edilir
- Kullanılmış puanlar geri alınamaz
- Süresi dolan kodlar kullanılamaz

