using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NjalaAPI.Models
{
    public class DocumentDownload
    {
        [Key]
        public Guid Id { get; set; }

        public Guid UserId { get; set; }
        public int DocumentId { get; set; }
        public DateTime DownloadedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("DocumentId")]
        public Document Document { get; set; }

    }

}
