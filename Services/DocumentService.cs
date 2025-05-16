using Microsoft.EntityFrameworkCore;
using NjalaAPI.Data;
using NjalaAPI.Models;
using NjalaAPI.DTOs;

namespace NjalaAPI.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly AppDbContext _context;

        public DocumentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<DocumentResponseDTO>> GetAllAsync()
        {
            return await _context.Documents
                .Select(d => new DocumentResponseDTO
                {
                    Id = d.Id,
                    Title = d.Title,
                    Description = d.Description,
                    CourseCode = d.CourseCode,
                    FilePath = d.FilePath,
                    Year = d.Year,
                    UploadDate = d.UploadDate,
                    Uploader = d.Uploader
                }).ToListAsync();
        }

        public async Task<DocumentResponseDTO?> GetByIdAsync(int id)
        {
            var d = await _context.Documents.FindAsync(id);
            if (d == null) return null;

            return new DocumentResponseDTO
            {
                Id = d.Id,
                Title = d.Title,
                Description = d.Description,
                CourseCode = d.CourseCode,
                FilePath = d.FilePath,
                Year = d.Year,
                UploadDate = d.UploadDate,
                Uploader = d.Uploader
            };
        }

        public async Task<Document?> AddAsync(Document doc)
        {
            _context.Documents.Add(doc);
            await _context.SaveChangesAsync();
            return doc;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return false;

            _context.Documents.Remove(doc);
            await _context.SaveChangesAsync();
            return true;
        }

        
    }
}
