using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NjalaAPI.Data;

namespace NjalaAPI.Controllers
{
    [ApiController]
    [Route("api/stats")]
    [Authorize(Roles = "SuperAdmin")]
    public class StatsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StatsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("global")]
        public async Task<IActionResult> GetGlobalStats()
        {
            // Count Admins (Role = "Admin" or "SuperAdmin")
            var admins = await _context.Users
                .Where(u => u.Role == "Admin" || u.Role == "SuperAdmin")
                .CountAsync();

            // Count Students
            var students = await _context.Users
                .Where(u => u.Role == "Student")
                .CountAsync();

            // Count Documents
            var documents = await _context.Documents.CountAsync();

            // Count Downloads
            var downloads = await _context.DocumentDownloads.CountAsync();

            return Ok(new
            {
                admins,
                students,
                documents,
                downloads
            });
        }
    }
}
