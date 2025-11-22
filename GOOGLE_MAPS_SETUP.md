# Harita Entegrasyonu Kurulum Rehberi

## ✅ Yapılandırma Tamamlandı!

Leaflet (OpenStreetMap) harita entegrasyonu başarıyla kuruldu. **API anahtarı gerekmez!**

## 🗺️ Kullanılan Teknoloji

**Leaflet + OpenStreetMap** kullanıyoruz - Google Maps yerine:
- ✅ Tamamen ücretsiz ve açık kaynak
- ✅ API anahtarı gerektirmez
- ✅ Kullanım limiti yok
- ✅ Hafif ve hızlı
- ✅ Her yerde çalışır

## 🚀 Hızlı Başlangıç

### 1. Frontend'i Başlatın

```bash
cd FrontEnd/Restoran
npm run dev
```

### 2. Haritayı Görüntüleyin

**Kullanıcı Olarak:**
- Ana sayfaya giriş yapın
- Üst menüden **Harita** butonuna tıklayın
- Veya direkt: `http://localhost:3000/restaurants/map`

**Admin Olarak:**
- Admin Dashboard'a gidin (`/admin/dashboard`)
- **Restoran Haritası** kartına tıklayın
- Veya direkt: `http://localhost:3000/admin/restaurants-map`

## 🎯 Özellikler

### ✅ Harita Özellikleri:
- 🗺️ OpenStreetMap temelli interaktif harita
- 📍 Turuncu marker'lar ile restoran konumları
- 💬 Marker'a tıklayınca popup ile detaylar
- 🖼️ Popup'ta restoran resmi, açıklama, puan
- 🔗 "Detayları Gör" butonu ile restoran sayfasına yönlendirme
- 📊 Konum bilgisi istatistikleri
- ⚠️ Konum bilgisi olmayan restoranlar için uyarı (Admin)
- 🚀 Hızlı yükleme ve sorunsuz çalışma

## 🎯 Restoranlara Konum Ekleme

Restoranların haritada görünmesi için konum bilgisi gereklidir:

1. Admin paneline girin
2. **Restoranlar** bölümüne gidin
3. Restoranı düzenleyin
4. `Latitude` ve `Longitude` değerlerini girin
5. Kaydedin

### Konum Bulma:
1. [Google Maps](https://www.google.com/maps) veya [OpenStreetMap](https://www.openstreetmap.org) açın
2. Restoranın konumunu bulun
3. Sağ tıklayın ve koordinatları kopyalayın
4. İlk sayı = Latitude, İkinci sayı = Longitude

### Test Koordinatları (Istanbul):
- **Taksim**: 41.0370, 28.9857
- **Kadıköy**: 40.9905, 29.0250
- **Beşiktaş**: 41.0422, 29.0070
- **Üsküdar**: 41.0252, 29.0108
- **Beyoğlu**: 41.0344, 28.9784

## 🔧 Kurulum Detayları

### Yüklü Paketler:
```bash
npm install leaflet react-leaflet @types/leaflet
```

### Avantajlar:
1. **API Anahtarı Yok** - Hiçbir kayıt veya kart bilgisi gerektirmez
2. **Sınırsız Kullanım** - Günlük limit yok
3. **Açık Kaynak** - Tamamen ücretsiz
4. **Hızlı** - Google Maps'ten daha hafif
5. **Güvenilir** - Milyonlarca site kullanıyor

## 📝 Kullanım

### Kullanıcı Sayfası: `/restaurants/map`
- Tüm restoranları harita üzerinde görüntüle
- Marker'lara tıklayarak detayları gör
- Popup'tan restoran sayfasına git
- İstatistikler: toplam, konum var/yok

### Admin Sayfası: `/admin/restaurants-map`
- Tüm restoranları yönetici olarak görüntüle
- Konum bilgisi eksik olanlar için uyarı
- Düzenleme sayfasına hızlı erişim
- Detaylı istatistikler

## 🎨 Özelleştirme

### Marker Rengini Değiştirme
`components/maps/RestaurantsMap.tsx` dosyasında:

```tsx
const customIcon = new Icon({
  iconUrl: 'marker-icon-2x-orange.png',  // Turuncu marker
  // Diğer renkler için:
  // 'marker-icon-2x-red.png'    - Kırmızı
  // 'marker-icon-2x-blue.png'   - Mavi
  // 'marker-icon-2x-green.png'  - Yeşil
  // ...
})
```

### Harita Stilini Değiştirme
Farklı harita stilleri için TileLayer URL'ini değiştirin:

```tsx
// Varsayılan OpenStreetMap
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

// Alternatifler:
// CartoDB Positron (Açık, minimal)
url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"

// CartoDB Dark Matter (Karanlık tema)
url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
```

## 🔧 Sorun Giderme

### "Harita Yükleniyor" Kalıyor
- Sayfayı yenileyin (F5)
- Browser console'da hata kontrolü yapın
- İnternet bağlantınızı kontrol edin

### Marker'lar Görünmüyor
- Restoranların `latitude` ve `longitude` değerlerini kontrol edin
- Değerler null veya 0 olmamalı
- Backend'den data geldiğini kontrol edin

### CSS Stilleri Hatalı
- Leaflet CSS'i otomatik yükleniyor
- Sorun varsa sayfayı yenileyin

## ✨ Tamamlanan İşlemler

✅ Leaflet paketi yüklendi  
✅ OpenStreetMap entegrasyonu yapıldı  
✅ Harita bileşeni oluşturuldu  
✅ Kullanıcı harita sayfası eklendi  
✅ Admin harita sayfası eklendi  
✅ Dashboard'a linkler eklendi  
✅ Navbar'a harita butonu eklendi  
✅ API anahtarı gerekmez - tamamen ücretsiz  

## 💡 Neden Leaflet?

Google Maps yerine Leaflet kullanmamızın nedenleri:
1. **Ücretsiz**: Hiçbir maliyet yok
2. **Kolay**: API anahtarı, kredi kartı gerektirmez
3. **Güvenilir**: Wikipedia, GitHub kullanıyor
4. **Hızlı**: Daha hafif ve optimize
5. **Açık Kaynak**: Topluluk desteği

**Artık kullanıma hazır! 🎉🗺️**
