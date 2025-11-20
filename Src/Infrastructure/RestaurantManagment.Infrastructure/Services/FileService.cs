using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using RestaurantManagment.Application.Common.Interfaces;

namespace RestaurantManagment.Infrastructure.Services;

public class FileService : IFileService
{
    private readonly IWebHostEnvironment _environment;
    private readonly string _uploadsFolder;
    private readonly long _maxFileSize = 5 * 1024 * 1024;
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

    public FileService(IWebHostEnvironment environment)
    {
        _environment = environment;
        _uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
        
        EnsureDirectoriesExist();
    }

    private void EnsureDirectoriesExist()
    {
        var directories = new[]
        {
            Path.Combine(_uploadsFolder, "profiles"),
            Path.Combine(_uploadsFolder, "menuitems"),
            Path.Combine(_uploadsFolder, "rewards"),
            Path.Combine(_uploadsFolder, "restaurants")
        };

        foreach (var directory in directories)
        {
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
        }
    }

    public async Task<string> UploadProfileImageAsync(IFormFile file, string userId)
    {
        return await UploadFileAsync(file, "profiles", userId);
    }

    public async Task<string> UploadMenuItemImageAsync(IFormFile file, string menuItemId)
    {
        return await UploadFileAsync(file, "menuitems", menuItemId);
    }

    public async Task<string> UploadRewardImageAsync(IFormFile file, string rewardId)
    {
        return await UploadFileAsync(file, "rewards", rewardId);
    }

    public async Task<string> UploadRestaurantImageAsync(IFormFile file, string restaurantId)
    {
        return await UploadFileAsync(file, "restaurants", restaurantId);
    }

    private async Task<string> UploadFileAsync(IFormFile file, string category, string entityId)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty");

        if (file.Length > _maxFileSize)
            throw new ArgumentException($"File size cannot exceed {_maxFileSize / 1024 / 1024}MB");

        var extension = Path.GetExtension(file.FileName ?? "").ToLowerInvariant();
        if (!_allowedExtensions.Contains(extension))
            throw new ArgumentException($"File type {extension} is not allowed. Allowed types: {string.Join(", ", _allowedExtensions)}");

        var fileName = $"{entityId}_{Guid.NewGuid()}{extension}";
        var categoryFolder = Path.Combine(_uploadsFolder, category);
        
        // Klasör yoksa oluştur
        if (!Directory.Exists(categoryFolder))
        {
            Directory.CreateDirectory(categoryFolder);
        }
        
        var filePath = Path.Combine(categoryFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return $"/uploads/{category}/{fileName}";
    }

    public async Task<bool> DeleteFileAsync(string fileUrl)
    {
        try
        {
            if (string.IsNullOrEmpty(fileUrl))
                return false;
            
            var relativePath = fileUrl.TrimStart('/');
            var filePath = Path.Combine(_environment.WebRootPath, relativePath);

            if (File.Exists(filePath))
            {
                await Task.Run(() => File.Delete(filePath));
                return true;
            }

            return false;
        }
        catch
        {
            return false;
        }
    }

    public Task<bool> FileExistsAsync(string fileUrl)
    {
        if (string.IsNullOrEmpty(fileUrl))
            return Task.FromResult(false);

        var relativePath = fileUrl.TrimStart('/');
        var filePath = Path.Combine(_environment.WebRootPath, relativePath);
        return Task.FromResult(File.Exists(filePath));
    }

    public string GetFileUrl(string fileName, string category)
    {
        return $"/uploads/{category}/{fileName}";
    }
}
