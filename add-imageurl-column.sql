-- OwnershipApplications tablosuna ImageUrl kolonu ekleme
ALTER TABLE [OwnershipApplications]
ADD [ImageUrl] nvarchar(500) NULL;
GO

SELECT 'ImageUrl kolonu başarıyla eklendi' AS Result;

