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
        var subject = "🎉 Hoş Geldiniz! E-posta Adresinizi Doğrulayın";
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }}
        .email-wrapper {{
            max-width: 600px;
            margin: 0 auto;
        }}
        .container {{
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 50px 30px;
            text-align: center;
            position: relative;
        }}
        .icon {{
            font-size: 64px;
            margin-bottom: 15px;
            display: inline-block;
        }}
        .header h1 {{
            color: white;
            font-size: 32px;
            font-weight: 700;
            margin: 0;
            position: relative;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .content {{
            padding: 50px 40px;
        }}
        .welcome-badge {{
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
        }}
        .welcome-text {{
            font-size: 24px;
            color: #1f2937;
            margin: 20px 0;
            font-weight: 600;
        }}
        .username {{
            color: #667eea;
            font-weight: 700;
        }}
        .message {{
            color: #6b7280;
            font-size: 16px;
            margin: 15px 0;
            line-height: 1.8;
        }}
        .button-container {{
            text-align: center;
            margin: 40px 0;
        }}
        .verify-button {{
            display: inline-block;
            padding: 18px 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none !important;
            border-radius: 50px;
            font-weight: 700;
            font-size: 18px;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
            border: none;
            cursor: pointer;
            mso-hide: all;
        }}
        .divider {{
            height: 1px;
            background: linear-gradient(to right, transparent, #e5e7eb, transparent);
            margin: 30px 0;
        }}
        .alternative-section {{
            background: #f9fafb;
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
        }}
        .alternative-section p {{
            margin: 0 0 12px 0;
            font-size: 14px;
            color: #6b7280;
            font-weight: 600;
        }}
        .link-box {{
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 2px dashed #e5e7eb;
            word-break: break-all;
            font-size: 13px;
            color: #667eea;
            margin-top: 10px;
        }}
        .link-box a {{
            color: #667eea;
            text-decoration: none;
        }}
        .features {{
            display: table;
            width: 100%;
            margin: 30px 0;
        }}
        .feature {{
            display: table-row;
        }}
        .feature-icon {{
            display: table-cell;
            padding: 10px 15px 10px 0;
            font-size: 24px;
            vertical-align: top;
        }}
        .feature-text {{
            display: table-cell;
            padding: 10px 0;
            color: #6b7280;
            font-size: 15px;
            vertical-align: top;
        }}
        .security-box {{
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 4px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
        }}
        .security-box strong {{
            color: #92400e;
            display: block;
            margin-bottom: 8px;
            font-size: 16px;
        }}
        .security-box p {{
            color: #78350f;
            margin: 0;
            font-size: 14px;
            line-height: 1.6;
        }}
        .footer {{
            background: #f9fafb;
            padding: 40px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }}
        .footer-logo {{
            font-size: 24px;
            margin-bottom: 15px;
        }}
        .footer p {{
            color: #9ca3af;
            font-size: 14px;
            margin: 8px 0;
        }}
        @media only screen and (max-width: 600px) {{
            .content {{
                padding: 30px 20px;
            }}
            .header {{
                padding: 40px 20px;
            }}
            .header h1 {{
                font-size: 24px;
            }}
            .welcome-text {{
                font-size: 20px;
            }}
            .verify-button {{
                padding: 16px 40px;
                font-size: 16px;
            }}
        }}
    </style>
</head>
<body>
    <div class='email-wrapper'>
        <div class='container'>
            <div class='header'>
                <div class='icon'>🎉</div>
                <h1>Hoş Geldiniz!</h1>
            </div>
            <div class='content'>
                <div class='welcome-badge'>✨ YENİ HESAP</div>
                <div class='welcome-text'>
                    Merhaba <span class='username'>{userName}</span>! 👋
                </div>
                <div class='message'>
                    <strong>Restaurant Management</strong> ailesine katıldığınız için çok mutluyuz! 
                    Hesabınızı aktif hale getirmek ve platformun tüm özelliklerinden yararlanabilmek için 
                    e-posta adresinizi doğrulamanız gerekmektedir.
                </div>
                
                <div class='features'>
                    <div class='feature'>
                        <div class='feature-icon'>🍽️</div>
                        <div class='feature-text'><strong>Harika restoranları keşfedin</strong> ve favori yemeklerinizi sipariş edin</div>
                    </div>
                    <div class='feature'>
                        <div class='feature-icon'>📅</div>
                        <div class='feature-text'><strong>Kolay rezervasyon yapın</strong> ve masanızı garantileyin</div>
                    </div>
                    <div class='feature'>
                        <div class='feature-icon'>⭐</div>
                        <div class='feature-text'><strong>Deneyimlerinizi paylaşın</strong> ve puanlama yapın</div>
                    </div>
                </div>

                <div class='divider'></div>

                <div class='message' style='text-align: center; font-size: 18px; color: #1f2937;'>
                    <strong>Hemen başlamak için e-posta adresinizi doğrulayın:</strong>
                </div>

                <!-- Button with multiple fallback methods -->
                <table width='100%' cellpadding='0' cellspacing='0' border='0' style='margin: 40px 0;'>
                    <tr>
                        <td align='center'>
                            <table cellpadding='0' cellspacing='0' border='0'>
                                <tr>
                                    <td align='center' style='border-radius: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);'>
                                        <a href='{verificationLink}' target='_blank' style='display: inline-block; padding: 18px 50px; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 18px; font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, sans-serif;'>
                                            ✓ E-posta Adresimi Doğrula
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <div class='alternative-section'>
                    <p>🔗 Buton çalışmıyorsa</p>
                    <p style='font-weight: 400; margin-bottom: 8px;'>Aşağıdaki linki tarayıcınıza kopyalayıp yapıştırın:</p>
                    <div class='link-box'>
                        <a href='{verificationLink}' target='_blank' style='color: #667eea; text-decoration: none;'>{verificationLink}</a>
                    </div>
                </div>

                <div class='security-box'>
                    <strong>🔒 Güvenlik ve Gizlilik</strong>
                    <p>
                        Bu doğrulama linki sadece <strong>bir kez kullanılabilir</strong> ve <strong>24 saat</strong> geçerlidir. 
                        Bu hesabı siz oluşturmadıysanız, bu e-postayı güvenle görmezden gelebilirsiniz. 
                        Hesabınız otomatik olarak silinecektir.
                    </p>
                </div>

                <div class='divider'></div>

                <div class='message' style='text-align: center; font-size: 14px;'>
                    Sorularınız mı var? Destek ekibimiz size yardımcı olmak için burada!<br>
                    📧 <a href='mailto:support@restaurantmanagement.com' style='color: #667eea; text-decoration: none;'>support@restaurantmanagement.com</a>
                </div>
            </div>
            <div class='footer'>
                <div class='footer-logo'>🍴</div>
                <p style='font-weight: 600; color: #6b7280; font-size: 16px;'>Restaurant Management</p>
                <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
                <div class='divider' style='margin: 20px 0;'></div>
                <p>© 2025 Restaurant Management. Tüm hakları saklıdır.</p>
                <p style='font-size: 12px; margin-top: 15px;'>
                    Bu e-postayı almak istemiyor musunuz? 
                    <a href='#' style='color: #667eea; text-decoration: none;'>Abonelikten çık</a>
                </p>
            </div>
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

    public async Task SendAccountDeletionConfirmationAsync(string to, string userName, string confirmationLink)
    {
        var subject = "Hesap Silme Onayı - Restaurant Management";
        
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
        <p>Hesabınızı silmek için bir talepte bulundunuz.</p>
        <div class='warning'>
            <strong>⚠️ UYARI: Hesabınız geçici olarak devre dışı bırakılacaktır. İstediğiniz zaman tekrar aktif edebilirsiniz.</strong>
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
