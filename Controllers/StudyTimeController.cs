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

            // Check if there's an active session
            var activeSession = await _context.StudyTimes
                .Where(st => st.UserId == userId && st.EndTime == null)
                .FirstOrDefaultAsync();

            if (activeSession != null)
            {
                return BadRequest("You already have an active study session. Please end it first.");
            }

            var studyTime = new StudyTime
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                StartTime = DateTime.UtcNow,
                Subject = dto.Subject
            };

            _context.StudyTimes.Add(studyTime);
            await _context.SaveChangesAsync();

            return Ok(new { id = studyTime.Id, startTime = studyTime.StartTime });
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
                return BadRequest("Study session already ended");

            studyTime.EndTime = DateTime.UtcNow;
            studyTime.DurationMinutes = (int)(studyTime.EndTime.Value - studyTime.StartTime).TotalMinutes;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = studyTime.Id,
                durationMinutes = studyTime.DurationMinutes,
                startTime = studyTime.StartTime,
                endTime = studyTime.EndTime
            });
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

