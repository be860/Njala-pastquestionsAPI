using NjalaAPI.Models;
using NjalaAPI.DTOs;

namespace NjalaAPI.Services.Interfaces
{
    public interface IAuditService
    {
        Task LogAsync(string action, string? description = null);
        Task<IEnumerable<AuditLogDto>> GetAllAsync();

    }
}
