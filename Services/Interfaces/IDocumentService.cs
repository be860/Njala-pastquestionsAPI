using NjalaAPI.DTOs;
using NjalaAPI.Models;

namespace NjalaAPI.Services
{
    public interface IDocumentService
    {
        Task<List<DocumentResponseDTO>> GetAllAsync();
        Task<DocumentResponseDTO?> GetByIdAsync(int id);
        Task<Document?> AddAsync(Document doc);
        Task<bool> DeleteAsync(int id);
        Task<Document?> UpdateAsync(Document doc);
    }
}
