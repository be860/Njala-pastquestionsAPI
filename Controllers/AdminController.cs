// Controllers/AdminController.cs
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

        public AdminController(IUserService userService, UserManager<ApplicationUser> userManager)
        {
            _userService = userService;
            _userManager = userManager;
        }

        [HttpGet]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetAdmins(
            int page = 1, int pageSize = 10, string? search = null)
        {
            var result = await _userService.GetAllUsersAsync(
                page, pageSize, search, "Admin");
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetAdmin(Guid id)
        {
            var admin = await _userService.GetUserByIdAsync(id);
            return admin != null && admin.Role == "Admin"
                ? Ok(admin)
                : NotFound();
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
            return CreatedAtAction(nameof(GetAdmin), new { id = user.Id }, user);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> UpdateAdmin(
            Guid id, UpdateUserDto dto)
        {
            dto.Role = "Admin";
            var updated = await _userService.UpdateUserAsync(id, dto);
            return updated != null ? Ok(updated) : NotFound();
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> DeleteAdmin(Guid id)
            => await _userService.DeleteUserAsync(id)
               ? NoContent()
               : NotFound();
    }
}
