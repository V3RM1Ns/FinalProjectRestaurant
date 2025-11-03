# Bu script owner hesabı için 5 restoran oluşturur
# PowerShell'de çalıştırın

Write-Host "Owner için restoranlar oluşturuluyor..." -ForegroundColor Green

# 1. Login yap ve token al
$loginBody = @{
    email = "owner@gmail.com"
    password = "Owner123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri 'http://localhost:5000/api/Account/login' -Method Post -Body $loginBody -ContentType 'application/json'
$token = $loginResponse.token
$ownerId = $loginResponse.user.id

Write-Host "Login başarılı! Owner ID: $ownerId" -ForegroundColor Yellow

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# Restoranları oluştur
$restaurants = @(
    @{
        name = "Lezzet Durağı"
        address = "Kızılay Mahallesi, Atatürk Bulvarı No: 123, Çankaya/Ankara"
        phoneNumber = "+903121234567"
        email = "info@lezzetduragi.com"
        website = "www.lezzetduragi.com"
        description = "Türk mutfağının en lezzetli yemeklerini modern bir atmosferde sunuyoruz."
        ownerId = $ownerId
    },
    @{
        name = "Pizza Palace"
        address = "Bahçelievler Mahallesi, İstiklal Caddesi No: 45, Çankaya/Ankara"
        phoneNumber = "+903129876543"
        email = "info@pizzapalace.com"
        website = "www.pizzapalace.com"
        description = "İtalyan pizza ve pasta çeşitleriyle hizmetinizdeyiz."
        ownerId = $ownerId
    },
    @{
        name = "Sushi Tokyo"
        address = "Kavaklidere, Tunalı Hilmi Caddesi No: 78, Çankaya/Ankara"
        phoneNumber = "+903125554433"
        email = "info@sushitokyo.com"
        website = "www.sushitokyo.com"
        description = "Otantik Japon mutfağı, taze ve kaliteli suşi çeşitleri."
        ownerId = $ownerId
    },
    @{
        name = "Burger House"
        address = "Ümitköy, Çayyolu Caddesi No: 156, Yenimahalle/Ankara"
        phoneNumber = "+903123336677"
        email = "info@burgerhouse.com"
        website = "www.burgerhouse.com"
        description = "Lezzetli burgerler ve patates kızartmaları ile fast food deneyimi."
        ownerId = $ownerId
    },
    @{
        name = "Vejetaryen Köşe"
        address = "Beşevler, 6. Cadde No: 34, Yenimahalle/Ankara"
        phoneNumber = "+903127778899"
        email = "info@vejetaryenkose.com"
        website = "www.vejetaryenkose.com"
        description = "Sağlıklı ve lezzetli vejetaryen ve vegan yemek seçenekleri."
        ownerId = $ownerId
    }
)

$created = 0
foreach ($restaurant in $restaurants) {
    try {
        $body = $restaurant | ConvertTo-Json
        $response = Invoke-RestMethod -Uri 'http://localhost:5000/api/Owner/restaurants' -Method Post -Headers $headers -Body $body
        Write-Host "✓ $($restaurant.name) başarıyla oluşturuldu!" -ForegroundColor Green
        $created++
    }
    catch {
        Write-Host "✗ $($restaurant.name) oluşturulamadı: $_" -ForegroundColor Red
    }
}

Write-Host "`n$created restoran başarıyla oluşturuldu!" -ForegroundColor Cyan
Write-Host "Şimdi frontend'i yenileyin: http://localhost:3000" -ForegroundColor Yellow

