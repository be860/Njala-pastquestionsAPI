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

            var uid = GetUserId();
            _context.DocumentDownloads.Add(new DocumentDownload
            {
                Id = Guid.NewGuid(),
                UserId = uid,
                DocumentId = doc.Id,
                DownloadedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            return ServeDocumentFile(doc.FilePath, inline: false);
        }

        [HttpGet("view/{id:int}")]
        public async Task<IActionResult> View(int id)
        {
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return NotFound();

            return ServeDocumentFile(doc.FilePath, inline: true);
        }

        private IActionResult ServeDocumentFile(string storedPath, bool inline)
        {
            try
            {
                var path = DocumentFileHelper.ResolveDocumentPath(storedPath);
                var fileName = DocumentFileHelper.SanitizeFileName(Path.GetFileName(path));
                var contentType = DocumentFileHelper.GetContentType(path);

                if (inline)
                {
                    Response.Headers.ContentDisposition = $"inline; filename=\"{fileName}\"";
                    return PhysicalFile(path, contentType);
                }

                return PhysicalFile(path, contentType, fileName);
            }
            catch (FileNotFoundException)
            {
                return NotFound("File not found");
            }
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileDto dto)
        {
            var userId = GetUserId();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound("User not found.");

            user.FullName = dto.FullName ?? user.FullName;
            user.PhoneNumber = dto.Phone ?? user.PhoneNumber;

            if (dto.Avatar != null && dto.Avatar.Length > 0)
            {
                // Validate file size (max 5MB)
                if (dto.Avatar.Length > 5 * 1024 * 1024)
                    return BadRequest("Avatar file size must be less than 5MB");

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var ext = Path.GetExtension(dto.Avatar.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(ext))
                    return BadRequest("Invalid file type. Allowed types: JPG, JPEG, PNG, GIF, WEBP");

                var fileName = $"{Guid.NewGuid()}{ext}";
                var savePath = Path.Combine("UploadedAvatars", fileName);
                var fullPath = Path.Combine(Directory.GetCurrentDirectory(), savePath);

                Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);
                using var stream = new FileStream(fullPath, FileMode.Create);
                await dto.Avatar.CopyToAsync(stream);

                user.AvatarUrl = $"/{savePath.Replace("\\", "/")}";
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                user.FullName,
                user.Email,
                user.PhoneNumber,
                user.AvatarUrl
            });
        }

        public class UpdateProfileDto
        {
            public string? FullName { get; set; }
            public string? Phone { get; set; }
            public IFormFile? Avatar { get; set; }
        }

    }
}
