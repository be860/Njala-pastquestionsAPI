using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NjalaAPI.Data;
using NjalaAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using NjalaAPI.DTOs.User;
using NjalaAPI.DTOs.Auth;
using NjalaAPI.Services.Interfaces;

namespace NjalaAPI.Controllers
{
    [ApiController]
    [Route("api/superadmin")]
    [Authorize(Roles = "SuperAdmin")]
    public class SuperAdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IUserService _userService;

        public SuperAdminController(AppDbContext context, IUserService userService)
        {
            _context = context;
            _userService = userService;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var users = await _context.Users.CountAsync();
            var documents = await _context.Documents.CountAsync();
            var downloads = await _context.DocumentDownloads.CountAsync();

            return Ok(new
            {
                users,
                documents,
                downloads
            });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.FullName,
                    u.Role
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPut("promote/{id}")]
        public async Task<IActionResult> PromoteToAdmin(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.Role = "Admin";
            await _context.SaveChangesAsync();
            return Ok("User promoted to Admin");
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("create-admin")]
        public async Task<IActionResult> CreateAdmin([FromBody] RegisterDTO dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("Email already exists.");

            var user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                Email = dto.Email,
                FullName = dto.FullName,
                UserName = dto.Email,
                Role = "Admin"
            };

            var userManager = HttpContext.RequestServices.GetRequiredService<UserManager<ApplicationUser>>();
            var result = await userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            await userManager.AddToRoleAsync(user, "Admin");
            return Ok(new { message = "Admin created successfully" });
        }

        [HttpGet("documents/recent")]
        public async Task<IActionResult> GetRecentDocuments()
        {
            var docs = await _context.Documents
                .OrderByDescending(d => d.UploadDate)
                .Take(5)
                .Select(d => new
                {
                    d.Id,
                    d.Title,
                    d.CourseCode,
                    d.Year,
                    d.UploadDate
                })
                .ToListAsync();

            return Ok(docs);
        }

        [HttpPut("documents/{id}")]
        public async Task<IActionResult> UpdateDocument(int id, [FromBody] Document updated)
        {
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return NotFound();

            doc.Title = updated.Title;
            doc.Description = updated.Description;
            doc.CourseCode = updated.CourseCode;
            doc.Year = updated.Year;
            await _context.SaveChangesAsync();

            return Ok("Document updated successfully.");
        }

        [HttpDelete("documents/{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return NotFound();

            _context.Documents.Remove(doc);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
