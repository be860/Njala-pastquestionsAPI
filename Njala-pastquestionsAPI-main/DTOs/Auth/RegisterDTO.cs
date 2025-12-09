namespace NjalaAPI.DTOs.Auth
{
    public class RegisterDTO
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string FullName { get; set; }
        public string Role { get; set; } = "Student"; // Default to Student, can be "Admin"
    }
}
