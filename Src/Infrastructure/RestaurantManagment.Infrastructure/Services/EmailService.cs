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

    public async Task SendEmailVerificationAsync(string to, string userName, string verificationLink)
    {
        var subject = "E-posta Adresinizi Doğrulayın - Restaurant Management";
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
        }}
        .header h1 {{
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .welcome-text {{
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
        }}
        .message {{
            color: #666;
            font-size: 15px;
            margin-bottom: 30px;
            line-height: 1.8;
        }}
        .button-container {{
            text-align: center;
            margin: 35px 0;
        }}
        .verify-button {{
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }}
        .verify-button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }}
        .alternative-link {{
            margin-top: 25px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 13px;
            color: #666;
            word-break: break-all;
        }}
        .alternative-link p {{
            margin: 0 0 10px 0;
            font-weight: 600;
            color: #333;
        }}
        .alternative-link a {{
            color: #667eea;
            text-decoration: none;
        }}
        .footer {{
            padding: 30px;
            text-align: center;
            background: #f8f9fa;
            color: #999;
            font-size: 13px;
            border-top: 1px solid #e9ecef;
        }}
        .security-note {{
            margin-top: 25px;
            padding: 15px;
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            border-radius: 4px;
            font-size: 13px;
            color: #856404;
        }}
        .icon {{
            font-size: 48px;
            margin-bottom: 15px;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div class='icon'>✉️</div>
            <h1>E-posta Doğrulama</h1>
        </div>
        <div class='content'>
            <div class='welcome-text'>
                Merhaba <strong>{userName}</strong>! 👋
            </div>
            <div class='message'>
                Restaurant Management sistemine hoş geldiniz! Hesabınızı aktif hale getirmek için e-posta adresinizi doğrulamanız gerekmektedir.
            </div>
            <div class='message'>
                E-posta adresinizi doğrulamak için aşağıdaki butona tıklayın:
            </div>
            <div class='button-container'>
                <a href='{verificationLink}' class='verify-button'>
                    E-posta Adresimi Doğrula
                </a>
            </div>
            <div class='alternative-link'>
                <p>Buton çalışmıyorsa, aşağıdaki linki tarayıcınıza kopyalayın:</p>
                <a href='{verificationLink}'>{verificationLink}</a>
            </div>
            <div class='security-note'>
                🔒 <strong>Güvenlik Notu:</strong> Bu link sadece bir kez kullanılabilir ve 24 saat geçerlidir. Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.
            </div>
        </div>
        <div class='footer'>
            <p>Bu e-posta Restaurant Management sistemi tarafından otomatik olarak gönderilmiştir.</p>
            <p>© 2025 Restaurant Management. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(to, subject, body);
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

    public async Task SendPasswordResetAsync(string to, string userName, string resetLink)
    {
        var subject = "Şifre Sıfırlama Talimatları - Restaurant Management";
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <style>
        body {{ font-family: Arial, sans-serif; background: #f8fafc; color: #222; }}
        .container {{ max-width: 500px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 32px; }}
        .btn {{ display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px; }}
        .footer {{ margin-top: 32px; font-size: 12px; color: #888; }}
    </style>
</head>
<body>
    <div class='container'>
        <h2>Merhaba {userName},</h2>
        <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
        <a href='{resetLink}' class='btn'>Şifre Sıfırla</a>
        <p style='margin-top:24px;'>Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        <div class='footer'>Restaurant Management ekibi</div>
    </div>
</body>
</html>
";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendDeleteAccountConfirmationAsync(string to, string userName, string confirmationLink, string deleteType)
    {
        var subject = "Hesap Silme Onayı - Restaurant Management";
        var deleteTypeText = deleteType.ToLower() == "soft" 
            ? "geçici olarak devre dışı bırakılacak" 
            : "kalıcı olarak silinecek";
        var warningText = deleteType.ToLower() == "soft"
            ? "Hesabınız geçici olarak devre dışı bırakılacak ve istediğiniz zaman tekrar aktif edebileceksiniz."
            : "⚠️ DİKKAT: Bu işlem geri alınamaz! Tüm verileriniz kalıcı olarak silinecektir.";
        
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background: #f8fafc; color: #222; }}
        .container {{ max-width: 500px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 32px; }}
        .warning {{ background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 4px; }}
        .btn {{ display: inline-block; background: #dc2626; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px; }}
        .footer {{ margin-top: 32px; font-size: 12px; color: #888; }}
    </style>
</head>
<body>
    <div class='container'>
        <h2>Merhaba {userName},</h2>
        <p>Hesabınızın {deleteTypeText} için bir talepte bulundunuz.</p>
        <div class='warning'>
            <strong>{warningText}</strong>
        </div>
        <p>Bu işlemi onaylamak için aşağıdaki butona tıklayın:</p>
        <a href='{confirmationLink}' class='btn'>Hesap Silmeyi Onayla</a>
        <p style='margin-top:24px;'>Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz ve hesabınız güvende olacaktır.</p>
        <div class='footer'>Restaurant Management ekibi</div>
    </div>
</body>
</html>
";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendAccountReactivationAsync(string to, string userName, string reactivationLink)
    {
        var subject = "Hesabınızı Tekrar Aktif Edin - Restaurant Management";
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background: #f8fafc; color: #222; }}
        .container {{ max-width: 500px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 32px; }}
        .btn {{ display: inline-block; background: #16a34a; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px; }}
        .footer {{ margin-top: 32px; font-size: 12px; color: #888; }}
    </style>
</head>
<body>
    <div class='container'>
        <h2>Tekrar Hoş Geldiniz {userName}! 👋</h2>
        <p>Hesabınız geçici olarak devre dışı bırakılmıştı. Hesabınızı tekrar aktif etmek ve Restaurant Management sistemini kullanmaya devam etmek isterseniz, aşağıdaki butona tıklayın:</p>
        <a href='{reactivationLink}' class='btn'>Hesabımı Tekrar Aktif Et</a>
        <p style='margin-top:24px;'>Bu linki kullanarak hesabınız tekrar aktif hale gelecek ve tüm verilerinize erişebileceksiniz.</p>
        <div class='footer'>Restaurant Management ekibi</div>
    </div>
</body>
</html>
";

        await SendEmailAsync(to, subject, body);
    }
}
