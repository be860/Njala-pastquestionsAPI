using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NjalaAPI.Data;
using NjalaAPI.Models;
using NjalaAPI.Services;

namespace NjalaAPI.Controllers
{
    [ApiController]
    [Route("api/ai-tutor")]
    [Authorize(Roles = "Student")]
    public class AITutorController : ControllerBase
    {
        private readonly GroqService _groqService;
        private readonly AppDbContext _context;

        public AITutorController(GroqService groqService, AppDbContext context)
        {
            _groqService = groqService;
            _context = context;
        }

        private Guid GetUserId()
        {
            var claim = User.FindFirst("id")?.Value;
            if (!Guid.TryParse(claim, out var id))
                throw new UnauthorizedAccessException("Invalid token");
            return id;
        }

        [HttpGet("sessions")]
        public async Task<IActionResult> GetSessions()
        {
            var userId = GetUserId();
            var sessions = await _context.ChatSessions
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.UpdatedAt)
                .Select(s => new
                {
                    s.Id,
                    s.Title,
                    s.CreatedAt,
                    s.UpdatedAt,
                    messageCount = s.Messages.Count
                })
                .ToListAsync();

            return Ok(sessions);
        }

        [HttpPost("sessions")]
        public async Task<IActionResult> CreateSession([FromBody] CreateSessionDto? dto)
        {
            var userId = GetUserId();
            var session = new ChatSession
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Title = string.IsNullOrWhiteSpace(dto?.Title) ? "New Chat" : dto.Title.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ChatSessions.Add(session);
            await _context.SaveChangesAsync();

            return Ok(new { session.Id, session.Title, session.CreatedAt, session.UpdatedAt });
        }

        [HttpGet("sessions/{id:guid}")]
        public async Task<IActionResult> GetSession(Guid id)
        {
            var userId = GetUserId();
            var session = await _context.ChatSessions
                .Include(s => s.Messages.OrderBy(m => m.CreatedAt))
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (session == null) return NotFound();

            return Ok(new
            {
                session.Id,
                session.Title,
                session.CreatedAt,
                session.UpdatedAt,
                messages = session.Messages.Select(m => new
                {
                    m.Id,
                    role = m.Role,
                    content = m.Content,
                    m.CreatedAt
                })
            });
        }

        [HttpDelete("sessions/{id:guid}")]
        public async Task<IActionResult> DeleteSession(Guid id)
        {
            var userId = GetUserId();
            var session = await _context.ChatSessions
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (session == null) return NotFound();

            _context.ChatSessions.Remove(session);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Session deleted" });
        }

        [HttpPost("sessions/{id:guid}/messages")]
        public async Task<IActionResult> SendMessage(Guid id, [FromBody] TutorQuestionDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Question))
                return BadRequest("Question cannot be empty.");

            var userId = GetUserId();
            var session = await _context.ChatSessions
                .Include(s => s.Messages.OrderBy(m => m.CreatedAt))
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (session == null) return NotFound();

            var question = dto.Question.Trim();
            var userMessage = new ChatMessage
            {
                Id = Guid.NewGuid(),
                SessionId = session.Id,
                Role = "user",
                Content = question,
                CreatedAt = DateTime.UtcNow
            };

            session.Messages.Add(userMessage);

            if (session.Title == "New Chat")
            {
                session.Title = question.Length > 50 ? question[..50] + "..." : question;
            }

            var history = session.Messages
                .Where(m => m.Id != userMessage.Id)
                .Select(m => new TutorChatMessage(m.Role, m.Content))
                .Append(new TutorChatMessage("user", question));

            var answer = await _groqService.AskTutorWithHistoryAsync(history);

            var assistantMessage = new ChatMessage
            {
                Id = Guid.NewGuid(),
                SessionId = session.Id,
                Role = "assistant",
                Content = answer,
                CreatedAt = DateTime.UtcNow
            };

            session.Messages.Add(assistantMessage);
            session.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                question,
                answer,
                sessionTitle = session.Title,
                userMessage = new { userMessage.Id, role = userMessage.Role, content = userMessage.Content, userMessage.CreatedAt },
                assistantMessage = new { assistantMessage.Id, role = assistantMessage.Role, content = assistantMessage.Content, assistantMessage.CreatedAt }
            });
        }

        [HttpPost("ask")]
        public async Task<IActionResult> AskTutor([FromBody] TutorQuestionDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Question))
                return BadRequest("Question cannot be empty.");

            var answer = await _groqService.AskTutorAsync(dto.Question);
            return Ok(new { question = dto.Question, answer });
        }
    }

    public class TutorQuestionDto
    {
        public string Question { get; set; } = string.Empty;
    }

    public class CreateSessionDto
    {
        public string? Title { get; set; }
    }
}
