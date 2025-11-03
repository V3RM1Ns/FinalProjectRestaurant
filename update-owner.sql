-- Bu script tüm restoranların owner ID'sini owner@gmail.com kullanıcısına atar

DECLARE @OwnerId NVARCHAR(450);

-- Owner kullanıcısının ID'sini bul
SELECT @OwnerId = Id FROM AspNetUsers WHERE Email = 'owner@gmail.com';

IF @OwnerId IS NULL
BEGIN
    PRINT 'HATA: owner@gmail.com bulunamadı!';
    RETURN;
END

PRINT 'Owner ID bulundu: ' + @OwnerId;

-- Tüm restoranların owner ID'sini güncelle
UPDATE Restaurants 
SET OwnerId = @OwnerId
WHERE IsDeleted = 0;

-- Kaç restoran güncellendi
DECLARE @UpdatedCount INT = @@ROWCOUNT;
PRINT CAST(@UpdatedCount AS VARCHAR) + ' restoran güncellendi!';

-- Sonuçları göster
SELECT 
    Id,
    Name,
    OwnerId,
    Address,
    PhoneNumber
FROM Restaurants
WHERE IsDeleted = 0 AND OwnerId = @OwnerId;

