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
}
