# Restoran Oluşturma Rehberi

## Otomatik Çözüm (Önerilen)

Backend'i yeniden başlatın, seed data otomatik olarak owner için 5 restoran oluşturacak:

```bash
cd C:\Users\user\Desktop\FinalProject-main\Src\Presentation\RestaurantManagment.WebAPI
dotnet run
```

Seed data şimdi owner@gmail.com hesabına özel restoran kontrolü yapıyor ve yoksa oluşturuyor.

---

## Manuel Çözüm (Eğer otomatik çalışmazsa)

### Swagger UI ile Manuel Restoran Oluşturma

1. **Backend'i çalıştırın**: http://localhost:5000
2. **Swagger'a gidin**: http://localhost:5000/swagger
3. **Login yapın**:
   - POST `/api/Account/login` endpoint'ini açın
   - "Try it out" butonuna tıklayın
   - Body:
   ```json
   {
     "email": "owner@gmail.com",
     "password": "Owner123!"
   }
   ```
   - Execute yapın
   - Response'tan **token**'ı kopyalayın

4. **Token'ı Swagger'a tanıtın**:
   - Sayfanın sağ üstündeki **Authorize** butonuna tıklayın
   - `Bearer {TOKEN}` formatında yapıştırın (Bearer kelimesini ekleyin)
   - Authorize butonuna tıklayın

5. **Restoran oluşturun**:
   - POST `/api/Owner/restaurants` endpoint'ini açın
   - "Try it out" butonuna tıklayın
   - Body:
   ```json
   {
     "name": "Lezzet Durağı",
     "address": "Kızılay Mahallesi, Atatürk Bulvarı No: 123, Çankaya/Ankara",
     "phoneNumber": "+903121234567",
     "email": "info@lezzetduragi.com",
     "website": "www.lezzetduragi.com",
     "description": "Türk mutfağının en lezzetli yemeklerini modern bir atmosferde sunuyoruz.",
     "ownerId": "OWNER_USER_ID_BURAYA"
   }
   ```
   - Execute yapın

### Postman ile Manuel Restoran Oluşturma

1. **Login Request**:
   - Method: POST
   - URL: http://localhost:5000/api/Account/login
   - Body (raw JSON):
   ```json
   {
     "email": "owner@gmail.com",
     "password": "Owner123!"
   }
   ```
   - Token'ı response'tan alın

2. **Create Restaurant Request**:
   - Method: POST
   - URL: http://localhost:5000/api/Owner/restaurants
   - Headers:
     - Authorization: Bearer {YOUR_TOKEN}
     - Content-Type: application/json
   - Body (raw JSON):
   ```json
   {
     "name": "Lezzet Durağı",
     "address": "Kızılay Mahallesi, Atatürk Bulvarı No: 123, Çankaya/Ankara",
     "phoneNumber": "+903121234567",
     "email": "info@lezzetduragi.com",
     "website": "www.lezzetduragi.com",
     "description": "Türk mutfağının en lezzetli yemeklerini modern bir atmosferde sunuyoruz.",
     "ownerId": "GET_FROM_TOKEN_OR_API"
   }
   ```

---

## Frontend ile Restoran Oluşturma

Eğer backend çalışıyorsa ve frontend açıksa:

1. http://localhost:3000/login sayfasına gidin
2. owner@gmail.com / Owner123! ile giriş yapın
3. "Restoran Oluştur" butonuna tıklayın
4. Formu doldurup gönderin

---

## Önerilen Restoranlar

İşte oluşturabileceğiniz 5 restoran:

### 1. Lezzet Durağı
```json
{
  "name": "Lezzet Durağı",
  "address": "Kızılay Mahallesi, Atatürk Bulvarı No: 123, Çankaya/Ankara",
  "phoneNumber": "+903121234567",
  "email": "info@lezzetduragi.com",
  "website": "www.lezzetduragi.com",
  "description": "Türk mutfağının en lezzetli yemeklerini modern bir atmosferde sunuyoruz.",
  "ownerId": "YOUR_OWNER_ID"
}
```

### 2. Pizza Palace
```json
{
  "name": "Pizza Palace",
  "address": "Bahçelievler Mahallesi, İstiklal Caddesi No: 45, Çankaya/Ankara",
  "phoneNumber": "+903129876543",
  "email": "info@pizzapalace.com",
  "website": "www.pizzapalace.com",
  "description": "İtalyan pizza ve pasta çeşitleriyle hizmetinizdeyiz.",
  "ownerId": "YOUR_OWNER_ID"
}
```

### 3. Sushi Tokyo
```json
{
  "name": "Sushi Tokyo",
  "address": "Kavaklidere, Tunalı Hilmi Caddesi No: 78, Çankaya/Ankara",
  "phoneNumber": "+903125554433",
  "email": "info@sushitokyo.com",
  "website": "www.sushitokyo.com",
  "description": "Otantik Japon mutfağı, taze ve kaliteli suşi çeşitleri.",
  "ownerId": "YOUR_OWNER_ID"
}
```

### 4. Burger House
```json
{
  "name": "Burger House",
  "address": "Ümitköy, Çayyolu Caddesi No: 156, Yenimahalle/Ankara",
  "phoneNumber": "+903123336677",
  "email": "info@burgerhouse.com",
  "website": "www.burgerhouse.com",
  "description": "Lezzetli burgerler ve patates kızartmaları ile fast food deneyimi.",
  "ownerId": "YOUR_OWNER_ID"
}
```

### 5. Vejetaryen Köşe
```json
{
  "name": "Vejetaryen Köşe",
  "address": "Beşevler, 6. Cadde No: 34, Yenimahalle/Ankara",
  "phoneNumber": "+903127778899",
  "email": "info@vejetaryenkose.com",
  "website": "www.vejetaryenkose.com",
  "description": "Sağlıklı ve lezzetli vejetaryen ve vegan yemek seçenekleri.",
  "ownerId": "YOUR_OWNER_ID"
}
```

---

## Sorun Giderme

### "Restoran Oluştur" mesajı çıkıyorsa:

1. **Backend'i durdurup yeniden başlatın** - Seed data güncellemesi devreye girecek
2. Backend loglarında "Seed data basariyla olusturuldu" mesajını kontrol edin
3. Veritabanında Restaurants tablosunu kontrol edin
4. Owner user ID'sini doğrulayın

### OwnerId nasıl bulunur?

Swagger'da veya Postman'de login yaptıktan sonra:
- GET `/api/Account/current-user` endpoint'ini çağırın
- Response'taki `id` alanı owner ID'dir

Ya da:
- Login response'undaki `user.id` alanını kullanın

