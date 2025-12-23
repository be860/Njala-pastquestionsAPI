using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NjalaAPI.Services;

namespace NjalaAPI.Controllers
{
    [ApiController]
    [Route("api/ai-tutor")]
    public class AITutorController : ControllerBase
    {
        private readonly GroqService _groqService;

        public AITutorController(GroqService groqService)
        {
            _groqService = groqService;
        }

        [Authorize(Roles = "Student")]
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
        public string Question { get; set; }
    }
}
