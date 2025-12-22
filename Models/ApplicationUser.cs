using Microsoft.AspNetCore.Identity;
using System;

namespace NjalaAPI.Models
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public required string FullName { get; set; }
        public string Role { get; set; } = "Student";
        public DateTime? LastLoginDate { get; set; }
        public string? AvatarUrl { get; set; }
        public bool IsApproved { get; set; } = true; // Students are approved by default, Admins need approval

    }
}
