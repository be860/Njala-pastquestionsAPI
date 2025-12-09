using System;

namespace NjalaAPI.Models
{
    public class StudyTime
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public int? DurationMinutes { get; set; } // Calculated duration in minutes
        public string? Subject { get; set; } // Optional subject/course code
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

