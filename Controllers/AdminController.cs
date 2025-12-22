using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NjalaAPI.Data;
using NjalaAPI.DTOs.User;
using NjalaAPI.Models;
using NjalaAPI.Services.Interfaces;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace NjalaAPI.Controllers
{
    [ApiController]
    [Route("api/admins")]
    public class AdminController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IAuditService _auditService;
        private readonly AppDbContext _context;

        public AdminController(
            IUserService userService,
            UserManager<ApplicationUser> userManager,
            IAuditService auditService,
            AppDbContext context)
        {
            _userService = userService;
            _userManager = userManager;
            _auditService = auditService;
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetAdmins(
            int page = 1, int pageSize = 10, string? search = null)
        {
            // Only return approved admins
            var query = _context.Users
                .Where(u => u.Role == "Admin" && u.IsApproved);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(u => u.FullName.Contains(search) || u.Email.Contains(search));

            var totalItems = await query.CountAsync();

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role
                })
                .ToListAsync();

            var result = new
            {
                Items = items,
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize
            };

            await _auditService.LogAsync("GetAdmins", "SuperAdmin fetched admin list.");
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetAdmin(Guid id)
        {
            var admin = await _userService.GetUserByIdAsync(id);

            if (admin != null && admin.Role == "Admin")
            {
                await _auditService.LogAsync("GetAdmin", $"SuperAdmin fetched admin with ID: {id}");
                return Ok(admin);
            }

            return NotFound();
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> CreateAdmin(CreateUserDto dto)
        {
            if (await _userManager.FindByEmailAsync(dto.Email) != null)
                return BadRequest("Email already exists");

            var user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                FullName = dto.FullName,
                Email = dto.Email,
                UserName = dto.Email,
                Role = "Admin"
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(user, "Admin");
            await _auditService.LogAsync("CreateAdmin", $"Admin created: {user.Email}");

            return CreatedAtAction(nameof(GetAdmin), new { id = user.Id }, user);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> UpdateAdmin(Guid id, UpdateUserDto dto)
        {
            dto.Role = "Admin";
            var updated = await _userService.UpdateUserAsync(id, dto);

            if (updated != null)
            {
                await _auditService.LogAsync("UpdateAdmin", $"Admin updated: {updated.Email}");
                return Ok(updated);
            }

            return NotFound();
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> DeleteAdmin(Guid id)
        {
            var deleted = await _userService.DeleteUserAsync(id);
            if (deleted)
            {
                await _auditService.LogAsync("DeleteAdmin", $"Admin deleted with ID: {id}");
                return NoContent();
            }

            return NotFound();
        }

        [HttpPost("approve/{id:guid}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> ApproveAdmin(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null || user.Role != "Admin")
                return NotFound("Admin not found.");

            user.IsApproved = true;
            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded)
            {
                await _auditService.LogAsync("ApproveAdmin", $"Admin approved: {user.Email}");
                return Ok(new { message = "Admin approved successfully" });
            }

            return BadRequest(result.Errors);
        }

        [HttpPost("reject/{id:guid}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> RejectAdmin(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null || user.Role != "Admin")
                return NotFound("Admin not found.");

            // Delete the user if rejected
            var result = await _userManager.DeleteAsync(user);
            if (result.Succeeded)
            {
                await _auditService.LogAsync("RejectAdmin", $"Admin rejected and deleted: {user.Email}");
                return Ok(new { message = "Admin rejected and removed" });
            }

            return BadRequest(result.Errors);
        }

        [HttpGet("pending")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetPendingAdmins()
        {
            var pendingAdmins = await _context.Users
                .Where(u => u.Role == "Admin" && !u.IsApproved && u.EmailConfirmed)
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.FullName,
                    u.Role
                })
                .ToListAsync();

            return Ok(pendingAdmins);
        }
    }
}
