using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using NjalaAPI.Models;
using NjalaAPI.DTOs;
using NjalaAPI.Services;

namespace NjalaAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DocumentController : ControllerBase
    {
        private readonly IDocumentService _documentService;
        private readonly IWebHostEnvironment _env;
        private readonly DocumentTextExtractor _textExtractor;
        private readonly GroqService _groqService;

        public DocumentController(
            IDocumentService documentService,
            IWebHostEnvironment env,
            DocumentTextExtractor textExtractor,
            GroqService groqService)
        {
            _documentService = documentService;
            _env = env;
            _textExtractor = textExtractor;
            _groqService = groqService;
        }

        // 📄 Get all documents with optional filters
        [HttpGet]
        public async Task<IActionResult> GetAllDocuments(
            int page = 1,
            int pageSize = 10,
            string? search = null,
            string? courseCode = null,
            int? year = null)
        {
            var docs = await _documentService.GetAllAsync();

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

        // 📄 Get a specific document by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var doc = await _documentService.GetByIdAsync(id);
            if (doc == null) return NotFound();
            return Ok(doc);
        }

        // 🧠 Upload document with AI summarization
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] DocumentUploadDto dto)
        {
            if (dto.File == null || dto.File.Length == 0)
                return BadRequest("No file uploaded.");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "UploadedFiles");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = dto.File.FileName;
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
                await dto.File.CopyToAsync(stream);

            // 🔹 Extract text & generate AI summary
            var extractedText = await _textExtractor.ExtractTextAsync(dto.File);
            var aiSummary = await _groqService.SummarizeDocumentAsync(extractedText);

            var document = new Document
            {
                Title = dto.Title,
                Description = dto.Description,
                CourseCode = dto.CourseCode,
                Year = dto.Year,
                FilePath = fileName,
                Uploader = User.Identity?.Name ?? "Unknown",
                UploadDate = DateTime.UtcNow,
                Summary = aiSummary // ✅ new AI field
            };

            await _documentService.AddAsync(document);
            return Ok(new
            {
                message = "Document uploaded successfully with AI summary.",
                document
            });
        }

        // 📥 Download a file
        [HttpGet("download/{id}")]
        public async Task<IActionResult> Download(int id)
        {
            var doc = await _documentService.GetByIdAsync(id);
            if (doc == null) return NotFound();

            try
            {
                var path = DocumentFileHelper.ResolveDocumentPath(doc.FilePath);
                var fileName = DocumentFileHelper.SanitizeFileName(Path.GetFileName(path));
                var contentType = DocumentFileHelper.GetContentType(path);
                return PhysicalFile(path, contentType, fileName);
            }
            catch (FileNotFoundException)
            {
                return NotFound("File not found");
            }
        }

        // ❌ Delete a document
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

        // 🔁 Regenerate AI Summary for an existing document
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HttpPost("ai-summary/{id}")]
        public async Task<IActionResult> GenerateAISummary(int id)
        {
            var docDto = await _documentService.GetByIdAsync(id);
            if (docDto == null)
                return NotFound("Document not found.");

            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), docDto.FilePath);
            if (!System.IO.File.Exists(fullPath))
                return NotFound("File not found on server.");

            // Extract the document text and generate a new summary using Groq AI
            using var stream = System.IO.File.OpenRead(fullPath);
            var formFile = new FormFile(stream, 0, stream.Length, "file", Path.GetFileName(fullPath));

            var extractedText = await _textExtractor.ExtractTextAsync(formFile);
            var newSummary = await _groqService.SummarizeDocumentAsync(extractedText);

            // Convert DTO -> Model to perform update
            var updatedDoc = new Document
            {
                Id = docDto.Id,
                Title = docDto.Title,
                Description = docDto.Description,
                CourseCode = docDto.CourseCode,
                FilePath = docDto.FilePath,
                Year = docDto.Year,
                UploadDate = docDto.UploadDate,
                Uploader = docDto.Uploader,
                Summary = newSummary
            };

            await _documentService.UpdateAsync(updatedDoc);

            return Ok(new
            {
                message = "AI summary regenerated successfully.",
                summary = newSummary
            });
        }
    }
}
