// Controllers/StudentDashboardController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NjalaAPI.Data;
using NjalaAPI.Models;
using NjalaAPI.Services;

namespace NjalaAPI.Controllers
{
    [ApiController]
    [Route("api/student-dashboard")]
    [Authorize(Roles = "Student")]
    public class StudentDashboardController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IDocumentService _documentService;

        public StudentDashboardController(
            AppDbContext context,
            IDocumentService documentService)
        {
            _context = context;
            _documentService = documentService;
        }

        private Guid GetUserId()
        {
            var claim = User.FindFirst("id")?.Value;
            if (!Guid.TryParse(claim, out var id))
                throw new UnauthorizedAccessException("Invalid token");
            return id;
        }

        [HttpGet("download-count")]
        public async Task<IActionResult> GetDownloadCount()
        {
            var uid = GetUserId();
            var cnt = await _context.DocumentDownloads.CountAsync(d => d.UserId == uid);
            return Ok(new { count = cnt });
        }

        [HttpGet("documents/count")]
        public async Task<IActionResult> GetDocumentsCount()
        {
            var cnt = await _context.Documents.CountAsync();
            return Ok(new { count = cnt });
        }

        [HttpGet("documents/recent")]
        public async Task<IActionResult> GetRecentDocuments()
        {
            var docs = await _context.Documents
                .OrderByDescending(d => d.UploadDate)
                .Take(5)
                .Select(d => new {
                    d.Id,
                    d.Title,
                    d.CourseCode,
                    d.Year,
                    d.UploadDate
                }).ToListAsync();
            return Ok(docs);
        }

        [HttpGet("download/{id:int}")]
        public async Task<IActionResult> Download(int id)
        {
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return NotFound();

            // log download
            var uid = GetUserId();
            _context.DocumentDownloads.Add(new DocumentDownload
            {
                Id = Guid.NewGuid(),
                UserId = uid,
                DocumentId = doc.Id,
                DownloadedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            // serve file
            var path = Path.Combine(Directory.GetCurrentDirectory(), "UploadedFiles", doc.FilePath);
            if (!System.IO.File.Exists(path)) return NotFound();
            var bytes = await System.IO.File.ReadAllBytesAsync(path);
            return File(bytes, "application/octet-stream", Path.GetFileName(path));
        }
    }
}
