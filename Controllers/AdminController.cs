using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NjalaAPI.DTOs.User;
using NjalaAPI.Models;
using NjalaAPI.Services.Interfaces;
using System;
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

        public AdminController(
            IUserService userService,
            UserManager<ApplicationUser> userManager,
            IAuditService auditService)
        {
            _userService = userService;
            _userManager = userManager;
            _auditService = auditService;
        }

        [HttpGet]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetAdmins(
            int page = 1, int pageSize = 10, string? search = null)
        {
            var result = await _userService.GetAllUsersAsync(page, pageSize, search, "Admin");
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
    }
}
