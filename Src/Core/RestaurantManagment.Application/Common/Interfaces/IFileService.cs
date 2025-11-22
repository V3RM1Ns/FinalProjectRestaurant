using Microsoft.AspNetCore.Http;

namespace RestaurantManagment.Application.Common.Interfaces;

public interface IFileService
{
    Task<string> UploadFileAsync(IFormFile file, string folder);
    Task<string> UploadProfileImageAsync(IFormFile file, string userId);
    Task<string> UploadMenuItemImageAsync(IFormFile file, string menuItemId);
    Task<string> UploadRewardImageAsync(IFormFile file, string rewardId);
    Task<string> UploadRestaurantImageAsync(IFormFile file, string restaurantId);
    Task<bool> DeleteFileAsync(string filePath);
    Task<bool> FileExistsAsync(string filePath);
    string GetFileUrl(string fileName, string category);
}
