using Google;
using Microsoft.EntityFrameworkCore;
using NjalaAPI.Data;
using NjalaAPI.Models;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<object> GetStudentDashboardSummaryAsync(string userId)
    {
        var user = await _context.Users.FindAsync(Guid.Parse(userId));
        if (user == null) return null;

        var totalDocuments = await _context.Documents.CountAsync();

        var recentUploads = await _context.Documents
            .OrderByDescending(d => d.UploadDate)
            .Take(5)
            .Select(d => new {
                d.Title,
                d.CourseCode,
                d.Year,
                UploadedBy = d.Uploader
            })
            .ToListAsync();

        return new
        {
            TotalDocuments = totalDocuments,
            RecentUploads = recentUploads,
            LastLogin = user.LastLoginDate
        };
    }
}
