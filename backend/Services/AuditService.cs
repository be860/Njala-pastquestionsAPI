using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using NjalaAPI.Data;
using NjalaAPI.DTOs;
using NjalaAPI.Models;
using NjalaAPI.Services.Interfaces;
using System.Security.Claims;
using Vonage.Conversations;

namespace NjalaAPI.Services
{
    public class AuditService : IAuditService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContext;

        public AuditService(AppDbContext context, IHttpContextAccessor httpContext)
        {
            _context = context;
            _httpContext = httpContext;
        }

        public async Task<IEnumerable<AuditLogDto>> GetAllAsync()
        {
            return await _context.AuditLogs
                .OrderByDescending(a => a.Timestamp)
                .Select(a => new AuditLogDto
                {
                    Id = a.Id,
                    Timestamp = a.Timestamp,
                    UserId = a.UserId,
                    UserEmail = a.UserEmail,
                    Action = a.Action,
                    Description = a.Description,
                    IpAddress = a.IpAddress
                })
                .ToListAsync();
        }

        public async Task LogAsync(string action, string? description = null)
        {
            var user = _httpContext.HttpContext?.User;
            var userId = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Anonymous";
            var userEmail = user?.FindFirst(ClaimTypes.Email)?.Value;
            var ip = _httpContext.HttpContext?.Connection.RemoteIpAddress?.ToString();

            var log = new AuditLog
            {
                Id = Guid.NewGuid(),
                Timestamp = DateTime.UtcNow,
                UserId = userId,
                UserEmail = userEmail,
                Action = action,
                Description = description,
                IpAddress = ip
            };

            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }
}


       
    }

