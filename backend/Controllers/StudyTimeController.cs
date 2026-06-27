using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NjalaAPI.Data;
using NjalaAPI.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace NjalaAPI.Controllers
{
    [ApiController]
    [Route("api/study-time")]
    [Authorize]
    public class StudyTimeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudyTimeController(AppDbContext context)
        {
            _context = context;
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                throw new UnauthorizedAccessException("Invalid user ID");
            return userId;
        }

        [HttpPost("start")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> StartStudySession([FromBody] StartStudySessionDto dto)
        {
            var userId = GetUserId();

            var activeSession = await _context.StudyTimes
                .Where(st => st.UserId == userId && st.EndTime == null)
                .FirstOrDefaultAsync();

            if (activeSession != null)
            {
                if (activeSession.StartTime < DateTime.UtcNow.AddHours(-12))
                {
                    activeSession.EndTime = DateTime.UtcNow;
                    activeSession.DurationMinutes = Math.Max(1,
                        (int)(activeSession.EndTime.Value - activeSession.StartTime).TotalMinutes);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    if (!string.IsNullOrWhiteSpace(dto.Subject))
                        activeSession.Subject = dto.Subject.Trim();

                    await _context.SaveChangesAsync();
                    return Ok(new { id = activeSession.Id, startTime = activeSession.StartTime, resumed = true });
                }
            }

            var studyTime = new StudyTime
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                StartTime = DateTime.UtcNow,
                Subject = string.IsNullOrWhiteSpace(dto.Subject) ? "General" : dto.Subject.Trim()
            };

            _context.StudyTimes.Add(studyTime);
            await _context.SaveChangesAsync();

            return Ok(new { id = studyTime.Id, startTime = studyTime.StartTime, resumed = false });
        }

        [HttpPost("end/{id:guid}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> EndStudySession(Guid id)
        {
            var userId = GetUserId();
            var studyTime = await _context.StudyTimes
                .FirstOrDefaultAsync(st => st.Id == id && st.UserId == userId);

            if (studyTime == null)
                return NotFound("Study session not found");

            if (studyTime.EndTime != null)
                return Ok(new
                {
                    id = studyTime.Id,
                    durationMinutes = studyTime.DurationMinutes,
                    startTime = studyTime.StartTime,
                    endTime = studyTime.EndTime
                });

            studyTime.EndTime = DateTime.UtcNow;
            studyTime.DurationMinutes = Math.Max(1,
                (int)(studyTime.EndTime.Value - studyTime.StartTime).TotalMinutes);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = studyTime.Id,
                durationMinutes = studyTime.DurationMinutes,
                startTime = studyTime.StartTime,
                endTime = studyTime.EndTime
            });
        }

        [HttpPost("end-active")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> EndActiveSession()
        {
            var userId = GetUserId();
            var studyTime = await _context.StudyTimes
                .FirstOrDefaultAsync(st => st.UserId == userId && st.EndTime == null);

            if (studyTime == null)
                return Ok(new { message = "No active session" });

            studyTime.EndTime = DateTime.UtcNow;
            studyTime.DurationMinutes = Math.Max(1,
                (int)(studyTime.EndTime.Value - studyTime.StartTime).TotalMinutes);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = studyTime.Id,
                durationMinutes = studyTime.DurationMinutes,
                startTime = studyTime.StartTime,
                endTime = studyTime.EndTime
            });
        }

        [HttpGet("active")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetActiveSession()
        {
            var userId = GetUserId();
            var studyTime = await _context.StudyTimes
                .Where(st => st.UserId == userId && st.EndTime == null)
                .OrderByDescending(st => st.StartTime)
                .Select(st => new
                {
                    st.Id,
                    st.StartTime,
                    st.Subject
                })
                .FirstOrDefaultAsync();

            if (studyTime == null)
                return NotFound();

            return Ok(studyTime);
        }

        [HttpGet("stats")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetStudyStats()
        {
            var userId = GetUserId();

            var totalMinutes = await _context.StudyTimes
                .Where(st => st.UserId == userId && st.DurationMinutes != null)
                .SumAsync(st => st.DurationMinutes ?? 0);

            var todayMinutes = await _context.StudyTimes
                .Where(st => st.UserId == userId 
                    && st.StartTime.Date == DateTime.UtcNow.Date 
                    && st.DurationMinutes != null)
                .SumAsync(st => st.DurationMinutes ?? 0);

            var thisWeekMinutes = await _context.StudyTimes
                .Where(st => st.UserId == userId 
                    && st.StartTime >= DateTime.UtcNow.AddDays(-7)
                    && st.DurationMinutes != null)
                .SumAsync(st => st.DurationMinutes ?? 0);

            var subjectStats = await _context.StudyTimes
                .Where(st => st.UserId == userId && st.DurationMinutes != null && !string.IsNullOrEmpty(st.Subject))
                .GroupBy(st => st.Subject)
                .Select(g => new
                {
                    subject = g.Key,
                    totalMinutes = g.Sum(st => st.DurationMinutes ?? 0)
                })
                .OrderByDescending(x => x.totalMinutes)
                .Take(10)
                .ToListAsync();

            return Ok(new
            {
                totalHours = Math.Round(totalMinutes / 60.0, 1),
                todayHours = Math.Round(todayMinutes / 60.0, 1),
                thisWeekHours = Math.Round(thisWeekMinutes / 60.0, 1),
                subjectStats
            });
        }

        [HttpGet("recent")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetRecentSessions(int limit = 10)
        {
            var userId = GetUserId();

            var sessions = await _context.StudyTimes
                .Where(st => st.UserId == userId && st.DurationMinutes != null)
                .OrderByDescending(st => st.StartTime)
                .Take(limit)
                .Select(st => new
                {
                    st.Id,
                    st.StartTime,
                    st.EndTime,
                    st.DurationMinutes,
                    st.Subject
                })
                .ToListAsync();

            return Ok(sessions);
        }
    }

    public class StartStudySessionDto
    {
        public string? Subject { get; set; }
    }
}

