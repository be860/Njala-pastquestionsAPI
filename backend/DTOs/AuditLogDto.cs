namespace NjalaAPI.DTOs
{
    public class AuditLogDto
    {
        public Guid Id { get; set; }
        public DateTime Timestamp { get; set; }
        public string UserId { get; set; }     // e.g. GUID string or “Anonymous”
        public string UserEmail { get; set; }  // could be null
        public string Action { get; set; }
        public string Description { get; set; }
        public string IpAddress { get; set; }
    }
}
