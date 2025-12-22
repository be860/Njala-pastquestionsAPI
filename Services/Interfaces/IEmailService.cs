public interface IEmailService
{
    Task SendAsync(string to, string subject, string message);
    Task SendOtpEmailAsync(string to, string otpCode, string userName = "User");
    Task SendLoginSuccessEmailAsync(string to, string userName, DateTime loginTime);
}
