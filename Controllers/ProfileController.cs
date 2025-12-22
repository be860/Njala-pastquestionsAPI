using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using NjalaAPI.Data;
using NjalaAPI.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace NjalaAPI.Controllers
{
    [ApiController]
    [Route("api/profile")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public ProfileController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                throw new UnauthorizedAccessException("Invalid user ID");
            return userId;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetUserId();
            var user = await _userManager.FindByIdAsync(userId.ToString());
            
            if (user == null)
                return NotFound("User not found");

            return Ok(new
            {
                user.Id,
                user.Email,
                user.FullName,
                user.PhoneNumber,
                user.AvatarUrl
            });
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileDto dto)
        {
            var userId = GetUserId();
            var user = await _userManager.FindByIdAsync(userId.ToString());
            
            if (user == null)
                return NotFound("User not found");

            user.FullName = dto.FullName ?? user.FullName;
            user.PhoneNumber = dto.Phone ?? user.PhoneNumber;

            if (dto.Avatar != null && dto.Avatar.Length > 0)
            {
                // Validate file size (max 5MB)
                if (dto.Avatar.Length > 5 * 1024 * 1024)
                    return BadRequest("Avatar file size must be less than 5MB");

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var ext = System.IO.Path.GetExtension(dto.Avatar.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(ext))
                    return BadRequest("Invalid file type. Allowed types: JPG, JPEG, PNG, GIF, WEBP");

                var fileName = $"{Guid.NewGuid()}{ext}";
                var savePath = System.IO.Path.Combine("UploadedAvatars", fileName);
                var fullPath = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), savePath);

                System.IO.Directory.CreateDirectory(System.IO.Path.GetDirectoryName(fullPath)!);
                using var stream = new System.IO.FileStream(fullPath, System.IO.FileMode.Create);
                await dto.Avatar.CopyToAsync(stream);

                user.AvatarUrl = $"/{savePath.Replace("\\", "/")}";
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new
            {
                user.FullName,
                user.Email,
                user.PhoneNumber,
                user.AvatarUrl
            });
        }
    }

    public class UpdateProfileDto
    {
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public IFormFile? Avatar { get; set; }
    }
}

