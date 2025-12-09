using System.ComponentModel.DataAnnotations;

namespace NjalaAPI.Models
{
    public class OtpVerification
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Target { get; set; } = string.Empty; // Email or phone

        [Required]
        public string Code { get; set; } = string.Empty;

        [Required]
        public string Type { get; set; } = "email"; // or "phone"

        public bool Verified { get; set; } = false;

        public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddMinutes(10);
    }
}
