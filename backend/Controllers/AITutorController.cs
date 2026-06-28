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
        private readonly DocumentSearchService _documentSearch;
        private readonly AppDbContext _context;

        public AITutorController(
            GroqService groqService,
            DocumentSearchService documentSearch,
            AppDbContext context)
        {
            _groqService = groqService;
            _documentSearch = documentSearch;
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
                    s.DocumentId,
                    s.DocumentTitle,
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
            var title = string.IsNullOrWhiteSpace(dto?.Title) ? "New Chat" : dto.Title.Trim();
            int? documentId = dto?.DocumentId;
            string? documentTitle = null;

            if (documentId.HasValue)
            {
                var doc = await _context.Documents.FindAsync(documentId.Value);
                if (doc == null)
                    return NotFound("Document not found.");

                documentTitle = doc.Title;
                if (string.IsNullOrWhiteSpace(dto?.Title))
                    title = TruncateTitle($"Study: {doc.Title}");
            }

            var session = new ChatSession
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Title = title,
                DocumentId = documentId,
                DocumentTitle = documentTitle,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ChatSessions.Add(session);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                session.Id,
                session.Title,
                session.DocumentId,
                session.DocumentTitle,
                session.CreatedAt,
                session.UpdatedAt,
                messageCount = 0
            });
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
                session.DocumentId,
                session.DocumentTitle,
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
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (session == null) return NotFound();

            var question = dto.Question.Trim();
            var targetDocumentId = dto.DocumentId ?? session.DocumentId;

            Document? document = await _documentSearch.FindBestMatchAsync(question, targetDocumentId);

            if (document != null)
            {
                session.DocumentId = document.Id;
                session.DocumentTitle = document.Title;
            }

            string? documentContext = null;
            if (document != null)
                documentContext = await _documentSearch.BuildDocumentContextAsync(document);
            else if (DocumentSearchService.LooksLikeDocumentQuestion(question))
            {
                documentContext =
                    "No matching past question document was found in the library for this request. " +
                    "Tell the student you could not locate the document, ask them to provide the exact document title, " +
                    "and offer general study help in the meantime.";
            }

            var historyMessages = await _context.ChatMessages
                .AsNoTracking()
                .Where(m => m.SessionId == id)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();

            var history = historyMessages
                .Select(m => new TutorChatMessage(m.Role, m.Content))
                .Append(new TutorChatMessage("user", question));

            var answer = await _groqService.AskTutorWithHistoryAsync(history, documentContext);

            var userMessage = new ChatMessage
            {
                Id = Guid.NewGuid(),
                SessionId = id,
                Role = "user",
                Content = question,
                CreatedAt = DateTime.UtcNow
            };

            var assistantMessage = new ChatMessage
            {
                Id = Guid.NewGuid(),
                SessionId = id,
                Role = "assistant",
                Content = answer,
                CreatedAt = DateTime.UtcNow
            };

            _context.ChatMessages.Add(userMessage);
            _context.ChatMessages.Add(assistantMessage);

            var newTitle = session.Title;
            if (session.Title == "New Chat")
            {
                newTitle = document != null
                    ? TruncateTitle($"Study: {document.Title}")
                    : TruncateTitle(question);
            }

            session.Title = newTitle;
            session.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                question,
                answer,
                sessionTitle = newTitle,
                referencedDocument = document == null ? null : new
                {
                    document.Id,
                    document.Title,
                    document.CourseCode,
                    document.Year
                },
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

        private static string TruncateTitle(string title)
            => title.Length > 50 ? title[..50] + "..." : title;
    }

    public class TutorQuestionDto
    {
        public string Question { get; set; } = string.Empty;
        public int? DocumentId { get; set; }
    }

    public class CreateSessionDto
    {
        public string? Title { get; set; }
        public int? DocumentId { get; set; }
    }
}
