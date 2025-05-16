using Microsoft.AspNetCore.Http;

namespace NjalaAPI.DTOs
{
    public class DocumentUploadDto
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string CourseCode { get; set; }
        public int Year { get; set; }
        public required IFormFile File { get; set; }
    }
}
