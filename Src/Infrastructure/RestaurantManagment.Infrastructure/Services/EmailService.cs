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

    public async Task SendOrderConfirmationEmailAsync(string to, string customerName, string orderId, string restaurantName, decimal totalAmount, string deliveryAddress, List<(string itemName, int quantity, decimal price)> items)
    {
        var subject = $"✅ Siparişiniz Alındı - #{orderId.Substring(0, 8).ToUpper()}";
        
        var itemsHtml = string.Join("", items.Select(item => $@"
                    <tr>
                        <td style='padding: 12px 0; border-bottom: 1px solid #e5e7eb;'>
                            <div style='font-weight: 600; color: #1f2937;'>{item.itemName}</div>
                            <div style='font-size: 13px; color: #9ca3af;'>Adet: {item.quantity}</div>
                        </td>
                        <td style='padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #1f2937;'>
                            ₺{(item.price * item.quantity):F2}
                        </td>
                    </tr>"));

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
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
        }}
        .icon {{
            font-size: 64px;
            margin-bottom: 15px;
            display: inline-block;
        }}
        .header h1 {{
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .order-id {{
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            margin-top: 10px;
            font-size: 14px;
            font-weight: 600;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .greeting {{
            font-size: 20px;
            color: #1f2937;
            margin-bottom: 15px;
            font-weight: 600;
        }}
        .message {{
            color: #6b7280;
            font-size: 15px;
            margin: 15px 0;
            line-height: 1.8;
        }}
        .info-box {{
            background: #f9fafb;
            padding: 20px;
            border-radius: 12px;
            margin: 25px 0;
            border-left: 4px solid #10b981;
        }}
        .info-box strong {{
            color: #1f2937;
            display: block;
            margin-bottom: 5px;
            font-size: 14px;
        }}
        .info-box p {{
            color: #6b7280;
            margin: 0;
            font-size: 15px;
        }}
        .order-details {{
            margin: 30px 0;
        }}
        .order-details h3 {{
            color: #1f2937;
            font-size: 18px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
        }}
        .items-table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }}
        .total-row {{
            background: #f0fdf4;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
        }}
        .total-row td {{
            padding: 8px 0;
            font-size: 16px;
        }}
        .total-row .total-label {{
            font-weight: 600;
            color: #1f2937;
        }}
        .total-row .total-amount {{
            text-align: right;
            font-weight: 700;
            color: #059669;
            font-size: 24px;
        }}
        .status-timeline {{
            background: #f9fafb;
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
        }}
        .status-timeline h4 {{
            color: #1f2937;
            font-size: 16px;
            margin-bottom: 15px;
        }}
        .timeline-item {{
            display: flex;
            align-items: center;
            padding: 10px 0;
            color: #6b7280;
            font-size: 14px;
        }}
        .timeline-item.active {{
            color: #059669;
            font-weight: 600;
        }}
        .timeline-icon {{
            width: 24px;
            height: 24px;
            background: #e5e7eb;
            border-radius: 50%;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }}
        .timeline-item.active .timeline-icon {{
            background: #10b981;
            color: white;
        }}
        .divider {{
            height: 1px;
            background: linear-gradient(to right, transparent, #e5e7eb, transparent);
            margin: 30px 0;
        }}
        .footer {{
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }}
        .footer-logo {{
            font-size: 24px;
            margin-bottom: 10px;
        }}
        .footer p {{
            color: #9ca3af;
            font-size: 13px;
            margin: 5px 0;
        }}
        @media only screen and (max-width: 600px) {{
            .content {{
                padding: 25px 20px;
            }}
            .header {{
                padding: 30px 20px;
            }}
            .header h1 {{
                font-size: 22px;
            }}
        }}
    </style>
</head>
<body>
    <div class='email-wrapper'>
        <div class='container'>
            <div class='header'>
                <div class='icon'>✅</div>
                <h1>Siparişiniz Alındı!</h1>
                <div class='order-id'>Sipariş No: #{orderId.Substring(0, 8).ToUpper()}</div>
            </div>
            <div class='content'>
                <div class='greeting'>Merhaba {customerName}! 👋</div>
                <div class='message'>
                    <strong>{restaurantName}</strong> restoranından verdiğiniz sipariş başarıyla alındı. 
                    Siparişiniz hazırlanmaya başlandı ve en kısa sürede adresinize teslim edilecek.
                </div>

                <div class='info-box'>
                    <strong>📍 Teslimat Adresi</strong>
                    <p>{deliveryAddress}</p>
                </div>

                <div class='order-details'>
                    <h3>📋 Sipariş Detayları</h3>
                    <table class='items-table'>
                        <tbody>
                            {itemsHtml}
                        </tbody>
                    </table>
                    <div class='total-row'>
                        <table style='width: 100%;'>
                            <tr>
                                <td class='total-label'>Toplam Tutar:</td>
                                <td class='total-amount'>₺{totalAmount:F2}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <div class='status-timeline'>
                    <h4>📦 Sipariş Durumu</h4>
                    <div class='timeline-item active'>
                        <div class='timeline-icon'>✓</div>
                        <span>Sipariş Alındı</span>
                    </div>
                    <div class='timeline-item'>
                        <div class='timeline-icon'>⏱</div>
                        <span>Hazırlanıyor</span>
                    </div>
                    <div class='timeline-item'>
                        <div class='timeline-icon'>🚚</div>
                        <span>Yola Çıktı</span>
                    </div>
                    <div class='timeline-item'>
                        <div class='timeline-icon'>🏠</div>
                        <span>Teslim Edildi</span>
                    </div>
                </div>

                <div class='divider'></div>

                <div class='message' style='text-align: center; font-size: 14px;'>
                    Siparişinizi takip etmek için hesabınıza giriş yapabilirsiniz.<br>
                    Sorularınız için: <a href='mailto:support@restaurantmanagement.com' style='color: #10b981; text-decoration: none;'>support@restaurantmanagement.com</a>
                </div>
            </div>
            <div class='footer'>
                <div class='footer-logo'>🍴</div>
                <p style='font-weight: 600; color: #6b7280; font-size: 15px;'>Restaurant Management</p>
                <p>Afiyet olsun! 🎉</p>
                <div class='divider' style='margin: 15px 0;'></div>
                <p>© 2025 Restaurant Management. Tüm hakları saklıdır.</p>
            </div>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(to, subject, body);
    }


    public async Task SendOrderStatusUpdateEmailAsync(string to, string customerName, string orderId, string restaurantName, string status, string? estimatedDeliveryTime = null)
    {
        var statusEmoji = status switch
        {
            "Preparing" => "👨‍🍳",
            "Ready" => "✅",
            "OnTheWay" => "🚚",
            "Delivered" => "🎉",
            _ => "📦"
        };

        var statusText = status switch
        {
            "Preparing" => "Hazırlanıyor",
            "Ready" => "Hazır",
            "OnTheWay" => "Yola Çıktı",
            "Delivered" => "Teslim Edildi",
            _ => status
        };

        var subject = $"{statusEmoji} Sipariş Durumu Güncellendi - #{orderId.Substring(0, 8).ToUpper()}";
        
        var deliveryInfo = !string.IsNullOrEmpty(estimatedDeliveryTime) 
            ? $"<div class='info-box'><strong>🕐 Tahmini Teslimat</strong><p>{estimatedDeliveryTime}</p></div>"
            : "";

        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background: #f8fafc; color: #222; }}
        .container {{ max-width: 500px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 32px; }}
        .header {{ text-align: center; padding: 20px 0; border-bottom: 2px solid #e5e7eb; }}
        .status-badge {{ display: inline-block; background: #10b981; color: #fff; padding: 12px 24px; border-radius: 20px; font-size: 18px; font-weight: bold; margin: 20px 0; }}
        .info-box {{ background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }}
        .info-box strong {{ display: block; color: #065f46; margin-bottom: 5px; }}
        .info-box p {{ margin: 0; color: #047857; }}
        .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #888; text-align: center; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 style='font-size: 48px; margin: 0;'>{statusEmoji}</h1>
            <h2 style='margin: 10px 0; color: #1f2937;'>Sipariş Durumu Güncellendi</h2>
            <p style='color: #6b7280;'>Sipariş No: #{orderId.Substring(0, 8).ToUpper()}</p>
        </div>
        <div style='padding: 20px 0;'>
            <h3>Merhaba {customerName},</h3>
            <p><strong>{restaurantName}</strong> restoranından verdiğiniz siparişinizin durumu güncellendi:</p>
            <div style='text-align: center;'>
                <div class='status-badge'>{statusText}</div>
            </div>
            {deliveryInfo}
            <p style='margin-top: 20px; color: #6b7280;'>Siparişinizi hesabınızdan takip edebilirsiniz.</p>
        </div>
        <div class='footer'>
            <p>Restaurant Management - Afiyet olsun! 🍴</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendOrderCancelledEmailAsync(string to, string customerName, string orderId, string restaurantName, string? reason = null)
    {
        var subject = $"❌ Sipariş İptal Edildi - #{orderId.Substring(0, 8).ToUpper()}";
        
        var reasonHtml = !string.IsNullOrEmpty(reason)
            ? $"<div class='warning'><strong>İptal Nedeni:</strong><p>{reason}</p></div>"
            : "";

        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background: #f8fafc; color: #222; }}
        .container {{ max-width: 500px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 32px; }}
        .header {{ text-align: center; padding: 20px 0; border-bottom: 2px solid #e5e7eb; }}
        .warning {{ background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 4px; }}
        .warning strong {{ color: #991b1b; display: block; margin-bottom: 5px; }}
        .warning p {{ margin: 0; color: #dc2626; }}
        .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #888; text-align: center; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 style='font-size: 48px; margin: 0;'>❌</h1>
            <h2 style='margin: 10px 0; color: #dc2626;'>Sipariş İptal Edildi</h2>
            <p style='color: #6b7280;'>Sipariş No: #{orderId.Substring(0, 8).ToUpper()}</p>
        </div>
        <div style='padding: 20px 0;'>
            <h3>Merhaba {customerName},</h3>
            <p><strong>{restaurantName}</strong> restoranından verdiğiniz sipariş iptal edildi.</p>
            {reasonHtml}
            <p style='margin-top: 20px; color: #6b7280;'>İade işlemi varsa, ödeme yönteminize göre 3-10 iş günü içinde hesabınıza yansıyacaktır.</p>
            <p style='margin-top: 10px; color: #6b7280;'>Sorularınız için bizimle iletişime geçebilirsiniz.</p>
        </div>
        <div class='footer'>
            <p>Restaurant Management</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendReservationConfirmationEmailAsync(string to, string customerName, string reservationId, string restaurantName, DateTime reservationDate, int numberOfGuests, string tableInfo)
    {
        var subject = $"✅ Rezervasyon Onaylandı - {restaurantName}";
        
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; }}
        .container {{ max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow: hidden; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }}
        .header h1 {{ margin: 0; font-size: 32px; }}
        .content {{ padding: 30px; }}
        .info-grid {{ display: grid; gap: 15px; margin: 20px 0; }}
        .info-item {{ background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }}
        .info-item strong {{ display: block; color: #4338ca; font-size: 12px; margin-bottom: 5px; }}
        .info-item p {{ margin: 0; color: #1f2937; font-size: 16px; font-weight: 600; }}
        .qr-section {{ text-align: center; padding: 20px; background: #f9fafb; border-radius: 8px; margin: 20px 0; }}
        .footer {{ background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #888; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 style='font-size: 48px; margin-bottom: 10px;'>🎉</h1>
            <h1>Rezervasyon Onaylandı!</h1>
            <p style='margin: 10px 0 0 0; opacity: 0.9;'>Rezervasyon No: #{reservationId.Substring(0, 8).ToUpper()}</p>
        </div>
        <div class='content'>
            <h2 style='color: #1f2937; margin-top: 0;'>Merhaba {customerName}! 👋</h2>
            <p style='color: #6b7280; line-height: 1.6;'>
                <strong>{restaurantName}</strong> restoranındaki rezervasyonunuz başarıyla oluşturuldu ve onaylandı.
            </p>
            
            <div class='info-grid'>
                <div class='info-item'>
                    <strong>📅 TARİH VE SAAT</strong>
                    <p>{reservationDate:dd MMMM yyyy, dddd - HH:mm}</p>
                </div>
                <div class='info-item'>
                    <strong>👥 KİŞİ SAYISI</strong>
                    <p>{numberOfGuests} Kişi</p>
                </div>
                <div class='info-item'>
                    <strong>🪑 MASA BİLGİSİ</strong>
                    <p>{tableInfo}</p>
                </div>
                <div class='info-item'>
                    <strong>🏪 RESTORAN</strong>
                    <p>{restaurantName}</p>
                </div>
            </div>

            <div class='qr-section'>
                <p style='color: #6b7280; margin: 0 0 10px 0;'>📱 Rezervasyon kodunuz:</p>
                <p style='font-family: monospace; font-size: 20px; font-weight: bold; color: #4338ca; margin: 0;'>
                    #{reservationId.Substring(0, 8).ToUpper()}
                </p>
            </div>

            <div style='background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 20px;'>
                <p style='margin: 0; color: #92400e; font-size: 14px;'>
                    <strong>⏰ Lütfen Not Edin:</strong> Rezervasyon saatinizden 15 dakika önce restoranda olmanızı rica ederiz.
                </p>
            </div>
        </div>
        <div class='footer'>
            <p style='font-weight: 600; color: #4338ca; font-size: 14px;'>Restaurant Management</p>
            <p>Keyifli bir yemek dileriz! 🍽️</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendReservationStatusUpdateEmailAsync(string to, string customerName, string reservationId, string restaurantName, DateTime reservationDate, string status, string? notes = null)
    {
        var statusEmoji = status switch
        {
            "Confirmed" => "✅",
            "Pending" => "⏳",
            "Cancelled" => "❌",
            "Completed" => "🎉",
            _ => "📋"
        };

        var statusText = status switch
        {
            "Confirmed" => "Onaylandı",
            "Pending" => "Beklemede",
            "Cancelled" => "İptal Edildi",
            "Completed" => "Tamamlandı",
            _ => status
        };

        var subject = $"{statusEmoji} Rezervasyon Durumu - {restaurantName}";
        
        var notesHtml = !string.IsNullOrEmpty(notes)
            ? $"<div style='background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;'><strong style='color: #1e40af;'>📝 Not:</strong><p style='margin: 5px 0 0 0; color: #1e3a8a;'>{notes}</p></div>"
            : "";

        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background: #f8fafc; color: #222; }}
        .container {{ max-width: 500px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 32px; }}
        .header {{ text-align: center; padding: 20px 0; border-bottom: 2px solid #e5e7eb; }}
        .status-badge {{ display: inline-block; background: #667eea; color: #fff; padding: 12px 24px; border-radius: 20px; font-size: 18px; font-weight: bold; margin: 20px 0; }}
        .info-box {{ background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }}
        .info-box strong {{ display: block; color: #065f46; margin-bottom: 5px; }}
        .info-box p {{ margin: 0; color: #047857; }}
        .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #888; text-align: center; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 style='font-size: 48px; margin: 0;'>{statusEmoji}</h1>
            <h2 style='margin: 10px 0; color: #1f2937;'>Rezervasyon Durumu Güncellendi</h2>
            <p style='color: #6b7280;'>Rezervasyon No: #{reservationId.Substring(0, 8).ToUpper()}</p>
        </div>
        <div style='padding: 20px 0;'>
            <h3>Merhaba {customerName},</h3>
            <p><strong>{restaurantName}</strong> restoranındaki rezervasyonunuzun durumu güncellendi:</p>
            <div style='text-align: center;'>
                <div class='status-badge'>{statusText}</div>
            </div>
            {notesHtml}
            <p style='margin-top: 20px; color: #6b7280;'>Rezervasyonunuzu hesabınızdan takip edebilirsiniz.</p>
        </div>
        <div class='footer'>
            <p>Restaurant Management 🍴</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendReservationCancelledEmailAsync(string to, string customerName, string reservationId, string restaurantName, DateTime reservationDate, string? reason = null)
    {
        var subject = $"❌ Rezervasyon İptal Edildi - {restaurantName}";
        
        var reasonHtml = !string.IsNullOrEmpty(reason)
            ? $"<div class='warning'><strong>İptal Nedeni:</strong><p>{reason}</p></div>"
            : "";

        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background: #f8fafc; color: #222; padding: 20px; }}
        .container {{ max-width: 500px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 32px; }}
        .header {{ text-align: center; padding: 20px 0; border-bottom: 2px solid #e5e7eb; }}
        .warning {{ background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 4px; }}
        .warning strong {{ color: #991b1b; display: block; margin-bottom: 5px; }}
        .warning p {{ margin: 0; color: #dc2626; }}
        .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #888; text-align: center; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 style='font-size: 48px; margin: 0;'>❌</h1>
            <h2 style='margin: 10px 0; color: #dc2626;'>Rezervasyon İptal Edildi</h2>
            <p style='color: #6b7280;'>Rezervasyon No: #{reservationId.Substring(0, 8).ToUpper()}</p>
        </div>
        <div style='padding: 20px 0;'>
            <h3>Merhaba {customerName},</h3>
            <p><strong>{restaurantName}</strong> restoranındaki rezervasyonunuz iptal edildi.</p>
            {reasonHtml}
            <p style='margin-top: 20px; color: #6b7280;'>Yeni bir rezervasyon oluşturmak için sistemimizi kullanabilirsiniz.</p>
        </div>
        <div class='footer'>
            <p>Restaurant Management</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendReservationReminderEmailAsync(string to, string customerName, string restaurantName, DateTime reservationDate, int numberOfGuests, string tableInfo)
    {
        var subject = $"⏰ Rezervasyon Hatırlatması - {restaurantName}";
        
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background: #f8fafc; color: #222; padding: 20px; }}
        .container {{ max-width: 500px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 32px; }}
        .header {{ text-align: center; padding: 20px 0; border-bottom: 2px solid #e5e7eb; }}
        .reminder-box {{ background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }}
        .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #888; text-align: center; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 style='font-size: 48px; margin: 0;'>⏰</h1>
            <h2 style='margin: 10px 0; color: #1f2937;'>Rezervasyon Hatırlatması</h2>
        </div>
        <div style='padding: 20px 0;'>
            <h3>Merhaba {customerName}! 👋</h3>
            <p>Yaklaşan rezervasyonunuzu hatırlatmak isteriz:</p>
            
            <div class='reminder-box'>
                <p style='margin: 0 0 10px 0; color: #92400e;'><strong>🏪 Restoran:</strong> {restaurantName}</p>
                <p style='margin: 0 0 10px 0; color: #92400e;'><strong>📅 Tarih ve Saat:</strong> {reservationDate:dd MMMM yyyy, HH:mm}</p>
                <p style='margin: 0 0 10px 0; color: #92400e;'><strong>👥 Kişi Sayısı:</strong> {numberOfGuests} Kişi</p>
                <p style='margin: 0; color: #92400e;'><strong>🪑 Masa:</strong> {tableInfo}</p>
            </div>

            <div style='background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;'>
                <p style='margin: 0; color: #1e3a8a;'>
                    <strong>💡 Hatırlatma:</strong> Lütfen rezervasyon saatinizden 15 dakika önce restoranda olunuz.
                </p>
            </div>
        </div>
        <div class='footer'>
            <p>Keyifli bir yemek dileriz! 🍽️</p>
            <p>Restaurant Management</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendReviewApprovedEmailAsync(string to, string customerName, string restaurantName, int rating)
    {
        var subject = $"✅ Yorumunuz Yayınlandı - {restaurantName}";
        var stars = new string('⭐', rating);
        
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background: #f8fafc; color: #222; padding: 20px; }}
        .container {{ max-width: 500px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 32px; }}
        .header {{ text-align: center; padding: 20px 0; border-bottom: 2px solid #e5e7eb; }}
        .success-box {{ background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; text-align: center; }}
        .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #888; text-align: center; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 style='font-size: 48px; margin: 0;'>✅</h1>
            <h2 style='margin: 10px 0; color: #1f2937;'>Yorumunuz Yayınlandı!</h2>
        </div>
        <div style='padding: 20px 0;'>
            <h3>Merhaba {customerName}! 👋</h3>
            <p><strong>{restaurantName}</strong> hakkında yaptığınız yorum incelendi ve onaylandı.</p>
            
            <div class='success-box'>
                <p style='font-size: 32px; margin: 10px 0;'>{stars}</p>
                <p style='margin: 10px 0; color: #065f46;'><strong>Değerlendirmeniz:</strong> {rating}/5</p>
                <p style='margin: 0; color: #047857; font-size: 14px;'>Yorumunuz artık diğer kullanıcılar tarafından görülebilir!</p>
            </div>

            <p style='color: #6b7280;'>Görüşlerinizi paylaştığınız için teşekkür ederiz. Yorumlarınız, diğer kullanıcıların doğru seçim yapmasına yardımcı oluyor! 💚</p>
        </div>
        <div class='footer'>
            <p>Restaurant Management</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendReviewRejectedEmailAsync(string to, string customerName, string restaurantName, string reason)
    {
        var subject = $"❌ Yorumunuz Hakkında - {restaurantName}";
        
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background: #f8fafc; color: #222; padding: 20px; }}
        .container {{ max-width: 500px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 32px; }}
        .header {{ text-align: center; padding: 20px 0; border-bottom: 2px solid #e5e7eb; }}
        .warning {{ background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 4px; }}
        .warning strong {{ color: #991b1b; display: block; margin-bottom: 8px; }}
        .warning p {{ margin: 0; color: #dc2626; line-height: 1.6; }}
        .info-box {{ background: #eff6ff; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0; }}
        .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #888; text-align: center; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 style='font-size: 48px; margin: 0;'>❌</h1>
            <h2 style='margin: 10px 0; color: #dc2626;'>Yorum Onaylanmadı</h2>
        </div>
        <div style='padding: 20px 0;'>
            <h3>Merhaba {customerName},</h3>
            <p><strong>{restaurantName}</strong> hakkında yaptığınız yorum incelendi ancak yayınlanması uygun görülmedi.</p>
            
            <div class='warning'>
                <strong>❌ Red Nedeni:</strong>
                <p>{reason}</p>
            </div>

            <div class='info-box'>
                <p style='margin: 0; color: #1e40af; font-size: 14px;'>
                    <strong>💡 İpucu:</strong> Yorumlarınızın yapıcı, saygılı ve topluluk kurallarına uygun olmasına dikkat ediniz. 
                    Uygun bir yorum yazarak tekrar deneyebilirsiniz.
                </p>
            </div>
        </div>
        <div class='footer'>
            <p>Anlayışınız için teşekkür ederiz.</p>
            <p>Restaurant Management</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendNewReviewNotificationToOwnerAsync(string to, string ownerName, string restaurantName, string customerName, int rating, string comment)
    {
        var subject = $"⭐ Yeni Yorum - {restaurantName}";
        var stars = new string('⭐', rating);
        
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background: #f8fafc; color: #222; padding: 20px; }}
        .container {{ max-width: 500px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 32px; }}
        .header {{ text-align: center; padding: 20px 0; border-bottom: 2px solid #e5e7eb; }}
        .review-box {{ background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }}
        .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #888; text-align: center; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 style='font-size: 48px; margin: 0;'>⭐</h1>
            <h2 style='margin: 10px 0; color: #1f2937;'>Yeni Müşteri Yorumu</h2>
        </div>
        <div style='padding: 20px 0;'>
            <h3>Merhaba {ownerName}! 👋</h3>
            <p><strong>{restaurantName}</strong> restoranınız için yeni bir yorum yapıldı.</p>
            
            <div class='review-box'>
                <p style='margin: 0 0 10px 0; color: #6b7280;'><strong>👤 Müşteri:</strong> {customerName}</p>
                <p style='margin: 0 0 15px 0; font-size: 24px;'>{stars}</p>
                <p style='margin: 0 0 5px 0; color: #6b7280;'><strong>💬 Yorum:</strong></p>
                <p style='margin: 0; color: #1f2937; font-style: italic; line-height: 1.6;'>&quot;{comment}&quot;</p>
            </div>

            <p style='color: #6b7280; font-size: 14px; margin-top: 30px;'>
                Yönetim panelinizden tüm yorumları görüntüleyebilir ve yanıt verebilirsiniz.
            </p>
        </div>
        <div class='footer'>
            <p>Restaurant Management</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendJobApplicationReceivedAsync(string applicantEmail, string applicantName, string jobTitle, string restaurantName)
    {
        var subject = "✅ Başvurunuz Alındı - " + jobTitle;
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f3f4f6;
            padding: 20px;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }}
        .header h1 {{
            margin: 0;
            font-size: 28px;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .info-box {{
            background: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }}
        .footer {{
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div style='font-size: 48px; margin-bottom: 10px;'>✅</div>
            <h1>Başvurunuz Alındı!</h1>
        </div>
        <div class='content'>
            <h2 style='color: #1f2937; margin-top: 0;'>Merhaba {applicantName}! 👋</h2>
            <p><strong>{restaurantName}</strong> restoranındaki <strong>{jobTitle}</strong> pozisyonu için başvurunuz başarıyla alınmıştır.</p>
            
            <div class='info-box'>
                <h3 style='margin-top: 0; color: #059669;'>📋 Başvuru Durumu</h3>
                <p style='margin: 0;'><strong>Pozisyon:</strong> {jobTitle}</p>
                <p style='margin: 10px 0 0 0;'><strong>Restoran:</strong> {restaurantName}</p>
                <p style='margin: 10px 0 0 0;'><strong>Durum:</strong> İnceleniyor</p>
            </div>

            <p>Başvurunuz değerlendirmeye alınmıştır. Başvuru sürecinde size bu e-posta adresi üzerinden bilgilendirme yapılacaktır.</p>
            
            <p style='color: #6b7280; font-size: 14px; margin-top: 30px;'>
                En kısa sürede size dönüş yapılacaktır. İyi şanslar! 🍀
            </p>
        </div>
        <div class='footer'>
            <p>Restaurant Management System</p>
            <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(applicantEmail, subject, body);
    }

    public async Task SendJobApplicationAcceptedAsync(string applicantEmail, string applicantName, string jobTitle, string restaurantName, string restaurantAddress, string interviewInfo)
    {
        var subject = "🎉 Tebrikler! Başvurunuz Kabul Edildi - Mülakat Davetiyesi";
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f3f4f6;
            padding: 20px;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }}
        .header h1 {{
            margin: 0;
            font-size: 28px;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .success-box {{
            background: #f0fdf4;
            border: 2px solid #10b981;
            padding: 25px;
            margin: 20px 0;
            border-radius: 12px;
            text-align: center;
        }}
        .interview-box {{
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }}
        .interview-box h3 {{
            margin-top: 0;
            color: #92400e;
        }}
        .interview-box p {{
            margin: 10px 0;
            color: #78350f;
        }}
        .footer {{
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div style='font-size: 64px; margin-bottom: 10px;'>🎉</div>
            <h1>Tebrikler!</h1>
            <p style='margin: 10px 0 0 0; font-size: 18px;'>Başvurunuz Kabul Edildi</p>
        </div>
        <div class='content'>
            <h2 style='color: #1f2937; margin-top: 0;'>Harika Haber, {applicantName}! 🌟</h2>
            
            <div class='success-box'>
                <div style='font-size: 48px; margin-bottom: 10px;'>✅</div>
                <p style='font-size: 18px; font-weight: bold; color: #059669; margin: 0;'>
                    {jobTitle} pozisyonu için başvurunuz kabul edildi!
                </p>
            </div>

            <p><strong>{restaurantName}</strong> restoranı sizi mülakata davet ediyor.</p>

            <div class='interview-box'>
                <h3>📅 Mülakat Bilgileri</h3>
                <p><strong>📍 Adres:</strong> {restaurantAddress}</p>
                <p><strong>🏢 Restoran:</strong> {restaurantName}</p>
                <p><strong>💼 Pozisyon:</strong> {jobTitle}</p>
                <div style='margin-top: 15px; padding-top: 15px; border-top: 1px solid #fbbf24;'>
                    <p style='margin: 0;'><strong>ℹ️ Detaylar:</strong></p>
                    <p style='margin: 10px 0 0 0; white-space: pre-line;'>{interviewInfo}</p>
                </div>
            </div>

            <p style='background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;'>
                <strong>💡 Önemli:</strong> Lütfen mülakat için zamanında hazır olun. Yanınızda kimlik belgenizi getirmeyi unutmayın.
            </p>

            <p style='color: #6b7280; font-size: 14px; margin-top: 30px;'>
                İyi şanslar! Ekibimizle tanışmayı dört gözle bekliyoruz. 🤝
            </p>
        </div>
        <div class='footer'>
            <p><strong>Restaurant Management System</strong></p>
            <p>Sorularınız için restoranla iletişime geçebilirsiniz.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(applicantEmail, subject, body);
    }
}
