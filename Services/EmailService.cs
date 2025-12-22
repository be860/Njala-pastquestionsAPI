using System.Net.Mail;
using System.Net;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendAsync(string to, string subject, string body)
    {
        var emailSettings = _config.GetSection("EmailSettings");
        var fromEmail = emailSettings["From"];
        var smtpHost = emailSettings["SmtpHost"];
        var smtpPort = int.Parse(emailSettings["SmtpPort"]);
        var username = emailSettings["Username"];
        var password = emailSettings["Password"];

        var message = new MailMessage(fromEmail, to, subject, body)
        {
            IsBodyHtml = true
        };

        using var smtp = new SmtpClient(smtpHost, smtpPort)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(username, password)
        };

        await smtp.SendMailAsync(message);
    }

    public async Task SendOtpEmailAsync(string to, string otpCode, string userName = "User")
    {
        var emailTemplate = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Your OTP Code</title>
</head>
<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f5f5f5;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse; background-color: #f5f5f5;'>
        <tr>
            <td align='center' style='padding: 40px 20px;'>
                <table role='presentation' style='max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;'>
                            <h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;'>Njala Past Questions</h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px;'>
                            <h2 style='margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;'>Hello {userName}!</h2>
                            <p style='margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;'>
                                You've requested a One-Time Password (OTP) to verify your account. Please use the code below to complete your verification:
                            </p>
                            <!-- OTP Code Box -->
                            <div style='text-align: center; margin: 30px 0;'>
                                <div style='display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
                                    <div style='font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: ''Courier New'', monospace;'>{otpCode}</div>
                                </div>
                            </div>
                            <p style='margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;'>
                                <strong>Important:</strong> This code will expire in 10 minutes. Do not share this code with anyone.
                            </p>
                            <p style='margin: 20px 0 0; color: #999999; font-size: 14px; line-height: 1.6;'>
                                If you didn't request this code, please ignore this email or contact our support team.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style='padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;'>
                            <p style='margin: 0; color: #999999; font-size: 12px; text-align: center; line-height: 1.6;'>
                                © {DateTime.UtcNow.Year} Njala Past Questions. All rights reserved.<br>
                                This is an automated email, please do not reply.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

        await SendAsync(to, "Your OTP Verification Code", emailTemplate);
    }

    public async Task SendLoginSuccessEmailAsync(string to, string userName, DateTime loginTime)
    {
        var emailTemplate = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Login Successful</title>
</head>
<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f5f5f5;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse; background-color: #f5f5f5;'>
        <tr>
            <td align='center' style='padding: 40px 20px;'>
                <table role='presentation' style='max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;'>
                            <div style='display: inline-block; width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 50%; line-height: 60px; margin-bottom: 10px;'>
                                <span style='font-size: 30px; color: #ffffff;'>✓</span>
                            </div>
                            <h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;'>Login Successful</h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px;'>
                            <h2 style='margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;'>Hello {userName}!</h2>
                            <p style='margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;'>
                                We're confirming that you've successfully logged into your Njala Past Questions account.
                            </p>
                            <!-- Login Details Box -->
                            <div style='background-color: #f8f9fa; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin: 30px 0;'>
                                <p style='margin: 0 0 10px; color: #333333; font-size: 14px; font-weight: 600;'>Login Details:</p>
                                <p style='margin: 5px 0; color: #666666; font-size: 14px;'><strong>Time:</strong> {loginTime:MMMM dd, yyyy 'at' HH:mm} UTC</p>
                                <p style='margin: 5px 0; color: #666666; font-size: 14px;'><strong>Account:</strong> {to}</p>
                            </div>
                            <p style='margin: 20px 0 0; color: #666666; font-size: 16px; line-height: 1.6;'>
                                If this wasn't you, please secure your account immediately by changing your password.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style='padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;'>
                            <p style='margin: 0; color: #999999; font-size: 12px; text-align: center; line-height: 1.6;'>
                                © {DateTime.UtcNow.Year} Njala Past Questions. All rights reserved.<br>
                                This is an automated email, please do not reply.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

        await SendAsync(to, "Login Successful - Njala Past Questions", emailTemplate);
    }
}
