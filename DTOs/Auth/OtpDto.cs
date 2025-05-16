namespace NjalaAPI.DTOs.Auth
{
    public class RequestOtpDto
    {
        public string Target { get; set; } = string.Empty; // email or phone
        public string Type { get; set; } = "email"; // or phone
    }

    public class VerifyOtpDto
    {
        public string Target { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Type { get; set; } = "email";
    }
}
