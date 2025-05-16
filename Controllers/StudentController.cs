// StudentController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NjalaAPI.Data;
using NjalaAPI.DTOs.User;
using NjalaAPI.Extensions;
using NjalaAPI.Services.Interfaces;

namespace NjalaAPI.Controllers
{
    [ApiController]
    [Authorize(Roles = "Student,Admin,SuperAdmin")]
    [Route("api/students")]
    public class StudentController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly AppDbContext _context;

        public StudentController(IUserService userService, AppDbContext context)
        {
            _userService = userService;
            _context = context;
        }




        

        // Admin-only: Manage Students
        [HttpGet]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> GetStudents(int page = 1, int pageSize = 10, string? search = null)
        {
            var result = await _userService.GetAllUsersAsync(page, pageSize, search, "Student");
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> GetStudent(Guid id)
        {
            var student = await _userService.GetUserByIdAsync(id);
            if (student == null || student.Role != "Student") return NotFound();
            return Ok(student);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> CreateStudent(CreateUserDto dto)
        {
            dto.Role = "Student";
            var created = await _userService.CreateUserAsync(dto);
            return CreatedAtAction(nameof(GetStudent), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> UpdateStudent(Guid id, UpdateUserDto dto)
        {
            dto.Role = "Student";
            var updated = await _userService.UpdateUserAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> DeleteStudent(Guid id)
        {
            var ok = await _userService.DeleteUserAsync(id);
            return ok ? NoContent() : NotFound();
        }


    }
}
