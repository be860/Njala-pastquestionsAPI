using System.ComponentModel.DataAnnotations;

namespace NjalaAPI.DTOs
{
    public class UploadDocumentDTO
    {
        [Required]
        public required string Title { get; set; }

        public string? Description { get; set; }

        [Required]
        public required string CourseCode { get; set; }

        [Required]
        public int Year { get; set; }

        [Required]
        public required IFormFile File { get; set; }
    }

    public class DocumentResponseDTO
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public required string FilePath { get; set; }
        public required string CourseCode { get; set; }
        public required string Uploader { get; set; }
        public DateTime UploadDate { get; set; }
        public int Year { get; set; }
    }
}
