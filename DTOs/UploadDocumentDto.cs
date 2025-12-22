using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace NjalaAPI.DTOs
{
    public class UploadDocumentDto
    {
        [Required]
        public required string Title { get; set; }

        public required string Description { get; set; }

        [Required]
        public required string CourseCode { get; set; }

        [Required]
        public int Year { get; set; }

        [Required]
        public required IFormFile File { get; set; }
    }
}
