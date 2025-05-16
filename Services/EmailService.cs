public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendAsync(string to, string subject, string message)
    {
        // Replace with SendGrid or SMTP logic
        Console.WriteLine($"Email to: {to} — {subject}: {message}");
        await Task.CompletedTask;
    }
}
