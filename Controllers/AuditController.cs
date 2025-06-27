using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NjalaAPI.DTOs;
using NjalaAPI.Services.Interfaces;

namespace NjalaAPI.Controllers
{
    [ApiController]
    [Route("api/audit")]
    [Authorize(Roles = "SuperAdmin")]
    public class AuditController : ControllerBase
    {
        private readonly IAuditService _auditService;

        public AuditController(IAuditService auditService)
        {
            _auditService = auditService;
        }

        [HttpGet("logs")]
        public async Task<IActionResult> GetAllLogs()
        {
            var list = await _auditService.GetAllAsync();
            // Returns List<AuditLogDto>
            return Ok(list);
        }
    }
}
