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
            var uid = GetUserId();
            var docs = await _context.DocumentDownloads
                .Where(d => d.UserId == uid)
                .Include(d => d.Document)
                .OrderByDescending(d => d.DownloadedAt)
                .Take(5)
                .Select(d => new {
                    d.Document.Id,
                    d.Document.Title,
                    d.Document.CourseCode,
                    d.Document.Year,
                    uploadDate = d.DownloadedAt
                }).ToListAsync();
            return Ok(docs);
        }

        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics()
        {
            var uid = GetUserId();
            var now = DateTime.UtcNow;

            var totalDocuments = await _context.Documents.CountAsync();
            var totalDownloads = await _context.DocumentDownloads.CountAsync(d => d.UserId == uid);

            var downloadsThisWeek = await _context.DocumentDownloads
                .CountAsync(d => d.UserId == uid && d.DownloadedAt >= now.AddDays(-7));

            var downloadsLastWeek = await _context.DocumentDownloads
                .CountAsync(d => d.UserId == uid
                    && d.DownloadedAt >= now.AddDays(-14)
                    && d.DownloadedAt < now.AddDays(-7));

            var studyMinutesTotal = await _context.StudyTimes
                .Where(st => st.UserId == uid && st.DurationMinutes != null)
                .SumAsync(st => st.DurationMinutes ?? 0);

            var studyMinutesThisWeek = await _context.StudyTimes
                .Where(st => st.UserId == uid && st.DurationMinutes != null && st.StartTime >= now.AddDays(-7))
                .SumAsync(st => st.DurationMinutes ?? 0);

            var studyMinutesLastWeek = await _context.StudyTimes
                .Where(st => st.UserId == uid && st.DurationMinutes != null
                    && st.StartTime >= now.AddDays(-14)
                    && st.StartTime < now.AddDays(-7))
                .SumAsync(st => st.DurationMinutes ?? 0);

            var downloadsBySubject = await _context.DocumentDownloads
                .Where(d => d.UserId == uid)
                .Include(d => d.Document)
                .GroupBy(d => d.Document.CourseCode)
                .Select(g => new
                {
                    subject = g.Key,
                    downloads = g.Count()
                })
                .ToListAsync();

            var studyBySubject = await _context.StudyTimes
                .Where(st => st.UserId == uid && st.DurationMinutes != null && !string.IsNullOrEmpty(st.Subject))
                .GroupBy(st => st.Subject!)
                .Select(g => new
                {
                    subject = g.Key,
                    totalMinutes = g.Sum(st => st.DurationMinutes ?? 0)
                })
                .ToListAsync();

            var allSubjects = downloadsBySubject.Select(d => d.subject)
                .Union(studyBySubject.Select(s => s.subject))
                .Distinct()
                .ToList();

            var subjectPerformance = allSubjects.Select(subject =>
            {
                var downloads = downloadsBySubject.FirstOrDefault(d => d.subject == subject)?.downloads ?? 0;
                var studyMinutes = studyBySubject.FirstOrDefault(s => s.subject == subject)?.totalMinutes ?? 0;
                var engagementScore = Math.Min(100, downloads * 20 + studyMinutes / 3);

                return new
                {
                    subject,
                    downloads,
                    studyMinutes,
                    engagementScore = (int)engagementScore
                };
            })
            .OrderByDescending(s => s.engagementScore)
            .Take(10)
            .ToList();

            var weekStarts = GetLastSixWeekStarts(now);
            var trendResults = new List<object>();
            foreach (var weekStart in weekStarts)
            {
                var index = weekStarts.IndexOf(weekStart);
                var weekEnd = index < weekStarts.Count - 1 ? weekStarts[index + 1] : now.AddDays(1);
                var weekDownloads = await _context.DocumentDownloads
                    .CountAsync(d => d.UserId == uid && d.DownloadedAt >= weekStart && d.DownloadedAt < weekEnd);
                var weekStudyMinutes = await _context.StudyTimes
                    .Where(st => st.UserId == uid && st.DurationMinutes != null
                        && st.StartTime >= weekStart && st.StartTime < weekEnd)
                    .SumAsync(st => st.DurationMinutes ?? 0);

                trendResults.Add(new
                {
                    week = weekStart.ToString("MMM dd"),
                    downloads = weekDownloads,
                    studyHours = Math.Round(weekStudyMinutes / 60.0, 1),
                    engagementScore = Math.Min(100, weekDownloads * 15 + weekStudyMinutes / 5)
                });
            }

            var uniqueDocumentsDownloaded = await _context.DocumentDownloads
                .Where(d => d.UserId == uid)
                .Select(d => d.DocumentId)
                .Distinct()
                .CountAsync();

            var overallProgress = totalDocuments > 0
                ? (int)Math.Round((double)uniqueDocumentsDownloaded / totalDocuments * 100)
                : 0;

            var bestSubject = subjectPerformance.FirstOrDefault();

            var downloadWeeklyChange = downloadsLastWeek > 0
                ? Math.Round((double)(downloadsThisWeek - downloadsLastWeek) / downloadsLastWeek * 100, 0)
                : downloadsThisWeek > 0 ? 100 : 0;

            var studyWeeklyChange = studyMinutesLastWeek > 0
                ? Math.Round((double)(studyMinutesThisWeek - studyMinutesLastWeek) / studyMinutesLastWeek * 100, 0)
                : studyMinutesThisWeek > 0 ? 100 : 0;

            return Ok(new
            {
                overallProgress,
                totalDownloads,
                downloadsThisWeek,
                downloadWeeklyChange,
                uniqueDocumentsDownloaded,
                totalDocuments,
                studyTime = new
                {
                    totalHours = Math.Round(studyMinutesTotal / 60.0, 1),
                    thisWeekHours = Math.Round(studyMinutesThisWeek / 60.0, 1),
                    weeklyChangePercent = studyWeeklyChange
                },
                bestSubject = bestSubject == null ? null : new
                {
                    bestSubject.subject,
                    score = bestSubject.engagementScore
                },
                subjectPerformance,
                weeklyTrend = trendResults,
                studyTimeBySubject = studyBySubject
                    .OrderByDescending(s => s.totalMinutes)
                    .Take(10)
                    .Select(s => new { s.subject, s.totalMinutes })
            });
        }

        private static List<DateTime> GetLastSixWeekStarts(DateTime now)
        {
            var starts = new List<DateTime>();
            var today = now.Date;
            var daysSinceMonday = ((int)today.DayOfWeek + 6) % 7;
            var thisWeekStart = today.AddDays(-daysSinceMonday);

            for (var i = 5; i >= 0; i--)
                starts.Add(thisWeekStart.AddDays(-7 * i));

            return starts;
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
