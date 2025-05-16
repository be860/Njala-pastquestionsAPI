using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using NjalaAPI.Models;
using NjalaAPI.Data;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using NjalaAPI.DTOs.Auth;
using NjalaAPI.Services.Interfaces;

namespace NjalaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IJwtTokenService _jwtService;
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IJwtTokenService jwtService,
            AppDbContext context,
            IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtService = jwtService;
            _context = context;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDTO model)
        {
            if (await _userManager.FindByEmailAsync(model.Email) != null)
                return BadRequest("Email already exists.");

            var user = new ApplicationUser
            {
                Email = model.Email,
                FullName = model.FullName,
                UserName = model.Email,
                Role = "Student"
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(user, "Student");

            return Ok(new { message = "Registration successful" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
                return Unauthorized("Invalid email or password.");

            if (user.TwoFactorEnabled)
            {
                return Ok(new
                {
                    requiresTwoFactorAuth = true,
                    email = user.Email
                });
            }

            user.LastLoginDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var roles = await _userManager.GetRolesAsync(user);
            var token = _jwtService.GenerateToken(user, roles);

            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Email,
                    user.FullName,
                    role = roles.FirstOrDefault(),
                    lastLogin = user.LastLoginDate
                }
            });
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin(GoogleLoginDTO model)
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(model.Credential);
            var user = await _userManager.FindByEmailAsync(payload.Email);

            if (user == null)
            {
                user = new ApplicationUser
                {
                    Email = payload.Email,
                    FullName = payload.Name,
                    UserName = payload.Email,
                    Role = "Student"
                };

                var result = await _userManager.CreateAsync(user, Guid.NewGuid().ToString("N") + "!Aa1");
                if (!result.Succeeded)
                    return BadRequest(result.Errors);

                await _userManager.AddToRoleAsync(user, "Student");
            }

            user.LastLoginDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var roles = await _userManager.GetRolesAsync(user);
            var token = _jwtService.GenerateToken(user, roles);

            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Email,
                    user.FullName,
                    role = roles.FirstOrDefault()
                }
            });
        }

        [HttpPost("verify-2fa")]
        public async Task<IActionResult> VerifyTwoFactor(Verify2FaDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return BadRequest("Invalid user.");

            var isValid = await _userManager.VerifyTwoFactorTokenAsync(
                user,
                TokenOptions.DefaultEmailProvider,
                dto.Code
            );

            if (!isValid)
                return BadRequest("Invalid 2FA code.");

            user.LastLoginDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var roles = await _userManager.GetRolesAsync(user);
            var token = _jwtService.GenerateToken(user, roles);

            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Email,
                    user.FullName,
                    role = roles.FirstOrDefault()
                }
            });
        }

        [HttpPost("request-otp")]
        public async Task<IActionResult> RequestOtp([FromBody] RequestOtpDto dto)
        {
            var recentOtp = await _context.OtpVerifications
                .Where(o => o.Target == dto.Target && o.Type == dto.Type)
                .OrderByDescending(o => o.ExpiresAt)
                .FirstOrDefaultAsync();

            if (recentOtp != null && (recentOtp.ExpiresAt - DateTime.UtcNow).TotalMinutes > 5)
                return BadRequest("You must wait before requesting a new OTP.");

            var code = new Random().Next(100000, 999999).ToString();

            var otp = new OtpVerification
            {
                Target = dto.Target,
                Type = dto.Type,
                Code = code,
                ExpiresAt = DateTime.UtcNow.AddMinutes(10)
            };

            _context.OtpVerifications.Add(otp);
            await _context.SaveChangesAsync();

            await _emailService.SendAsync(dto.Target, "Your OTP Code", $"Your OTP is: {code}");

            return Ok(new { message = "OTP sent" });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
        {
            var otp = await _context.OtpVerifications
                .Where(o => o.Target == dto.Target && o.Type == dto.Type && !o.Verified)
                .OrderByDescending(o => o.ExpiresAt)
                .FirstOrDefaultAsync();

            if (otp == null || otp.Code != dto.Code || otp.ExpiresAt < DateTime.UtcNow)
                return BadRequest("Invalid or expired OTP");

            otp.Verified = true;
            await _context.SaveChangesAsync();

            var user = await _userManager.FindByEmailAsync(dto.Target);
            if (user != null)
            {
                user.EmailConfirmed = true;
                await _userManager.UpdateAsync(user);
            }

            return Ok("Verified successfully");
        }
    }
}
