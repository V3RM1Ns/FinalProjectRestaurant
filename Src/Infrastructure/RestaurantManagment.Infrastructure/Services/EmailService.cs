using RestaurantManagment.Application.Common.Interfaces;
using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace RestaurantManagment.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpHost = _configuration["EmailSettings:SmtpHost"] ?? "smtp.gmail.com";
        var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
        var smtpUsername = _configuration["EmailSettings:SmtpUsername"] ?? "";
        var smtpPassword = _configuration["EmailSettings:SmtpPassword"] ?? "";
        var fromEmail = _configuration["EmailSettings:FromEmail"] ?? smtpUsername;

        using var client = new SmtpClient(smtpHost, smtpPort)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(smtpUsername, smtpPassword)
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(fromEmail),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };

        mailMessage.To.Add(to);

        try
        {
            await client.SendMailAsync(mailMessage);
        }
        catch (Exception ex)
        {
            // Log the error - in production, use proper logging
            Console.WriteLine($"Email sending failed: {ex.Message}");
            throw;
        }
    }

    public async Task SendJobApplicationStatusEmailAsync(string applicantEmail, string applicantName, string jobTitle, string restaurantName, string status, string? notes = null)
    {
        var subject = $"İş Başvurunuz Hakkında - {restaurantName}";
        var statusText = status == "Accepted" ? "kabul edildi" : "reddedildi";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Sayın {applicantName},</h2>
                <p><strong>{restaurantName}</strong> restoranında <strong>{jobTitle}</strong> pozisyonuna yaptığınız başvuru <strong>{statusText}</strong>.</p>
                {(status == "Accepted" ? "<p>Tebrikler! Başvurunuz onaylandı. Yakında sizinle iletişime geçeceğiz.</p>" : "")}
                {(!string.IsNullOrEmpty(notes) ? $"<p><strong>Değerlendirme Notu:</strong> {notes}</p>" : "")}
                <p>İyi günler dileriz,<br/>{restaurantName} Ekibi</p>
            </body>
            </html>
        ";

        await SendEmailAsync(applicantEmail, subject, body);
    }

    public async Task SendNewJobApplicationNotificationAsync(string ownerEmail, string ownerName, string applicantName, string jobTitle, string restaurantName)
    {
        var subject = $"Yeni İş Başvurusu - {restaurantName}";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Sayın {ownerName},</h2>
                <p><strong>{applicantName}</strong> isimli kullanıcı <strong>{restaurantName}</strong> restoranınızda <strong>{jobTitle}</strong> pozisyonuna başvuruda bulundu.</p>
                <p>Başvuruyu incelemek için lütfen dashboard'unuzu kontrol edin.</p>
                <p>İyi çalışmalar dileriz!</p>
            </body>
            </html>
        ";

        await SendEmailAsync(ownerEmail, subject, body);
    }
}

