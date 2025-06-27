using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using NjalaAPI.Models;
using NjalaAPI.DTOs;

namespace NjalaAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]

    public class DocumentController : ControllerBase
    {
        private readonly IDocumentService _documentService;
        private readonly IWebHostEnvironment _env;

        public DocumentController(IDocumentService documentService, IWebHostEnvironment env)
        {
            _documentService = documentService;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllDocuments(
        int page = 1,
        int pageSize = 10,
        string? search = null,
        string? courseCode = null,
        int? year = null)
        {
            // fetch all
            var docs = await _documentService.GetAllAsync();

            // apply filters
            if (!string.IsNullOrWhiteSpace(search))
                docs = docs.Where(d =>
                    d.Title.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    d.Description.Contains(search, StringComparison.OrdinalIgnoreCase))
                    .ToList();

            if (!string.IsNullOrWhiteSpace(courseCode))
                docs = docs.Where(d =>
                    d.CourseCode.Equals(courseCode, StringComparison.OrdinalIgnoreCase))
                    .ToList();

            if (year.HasValue)
                docs = docs.Where(d => d.Year == year.Value).ToList();

            // paging
            var total = docs.Count;
            var items = docs
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(new
            {
                Items = items,
                TotalItems = total,
                Page = page,
                PageSize = pageSize
            });
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var doc = await _documentService.GetByIdAsync(id);
            if (doc == null) return NotFound();
            return Ok(doc);
        }

        [Authorize(Roles = "Admin,SuperAdmin")]
        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] DocumentUploadDto dto)
        {
            if (dto.File == null || dto.File.Length == 0)
                return BadRequest("No file uploaded.");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "UploadedFiles");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var filePath = Path.Combine(uploadsFolder, dto.File.FileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            var document = new Document
            {
                Title = dto.Title,
                Description = dto.Description,
                CourseCode = dto.CourseCode,
                Year = dto.Year,
                FilePath = filePath,
                Uploader = User.Identity?.Name ?? "Unknown", // or use claims
                UploadDate = DateTime.UtcNow
            };

            await _documentService.AddAsync(document);

            return Ok("Document uploaded successfully.");
        }


        [HttpGet("download/{id}")]
        public async Task<IActionResult> Download(int id)
        {
            var doc = await _documentService.GetByIdAsync(id);
            if (doc == null) return NotFound();

            var path = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), doc.FilePath);
            if (!System.IO.File.Exists(path)) return NotFound("File not found");

            return PhysicalFile(path, "application/octet-stream", Path.GetFileName(path));
        }

        [Authorize(Roles = "Admin,SuperAdmin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var doc = await _documentService.GetByIdAsync(id);
            if (doc == null) return NotFound();

            var path = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), doc.FilePath);
            if (System.IO.File.Exists(path))
                System.IO.File.Delete(path);

            var success = await _documentService.DeleteAsync(id);
            return success ? Ok(new { message = "Deleted" }) : StatusCode(500, "Failed to delete");
        }
    }
}
