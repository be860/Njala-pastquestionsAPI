using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using NjalaAPI.Models;
using NjalaAPI.Data;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using NjalaAPI.DTOs.Auth;
using NjalaAPI.Services.Interfaces;
using NjalaAPI.Services;
using System.Net;
using NjalaAPI.DTOs;
using Microsoft.AspNetCore.Authorization;

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
        private readonly IAuditService _auditService;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IJwtTokenService jwtService,
            AppDbContext context,
            IEmailService emailService,
            IAuditService auditService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtService = jwtService;
            _context = context;
            _emailService = emailService;
            _auditService = auditService;
        }

        [AllowAnonymous]
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
            await _auditService.LogAsync("Register", $"New student registered: {user.Email}");

            return Ok(new { message = "Registration successful" });
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return Unauthorized("Invalid email or password.");

            if (!user.EmailConfirmed)
                return Unauthorized("Please verify your email before logging in.");

            if (!await _userManager.CheckPasswordAsync(user, model.Password))
                return Unauthorized("Invalid email or password.");

            if (user.TwoFactorEnabled)
            {
                return Ok(new { requiresTwoFactorAuth = true, email = user.Email });
            }

            user.LastLoginDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var roles = await _userManager.GetRolesAsync(user);
            var token = _jwtService.GenerateToken(user, roles);

            var refreshTokenEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                Token = Guid.NewGuid().ToString("N"),
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                UserId = user.Id
            };
            _context.RefreshTokens.Add(refreshTokenEntity);
            await _context.SaveChangesAsync();

            await _emailService.SendAsync(
                user.Email,
                "Login Successful",
                $"Hello {user.FullName},<br/><br/>You have successfully logged in on {DateTime.UtcNow:MMMM dd, yyyy HH:mm} UTC.");
            await _auditService.LogAsync("Login", $"User {user.Email} logged in.");

            return Ok(new
            {
                token,
                refreshToken = refreshTokenEntity.Token,
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
            var refreshTokenEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                Token = Guid.NewGuid().ToString("N"),
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                UserId = user.Id
            };
            _context.RefreshTokens.Add(refreshTokenEntity);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                token,
                refreshToken = refreshTokenEntity.Token,
                user = new { user.Id, user.Email, user.FullName, role = roles.FirstOrDefault() }
            });
        }

        [HttpPost("verify-2fa")]
        public async Task<IActionResult> VerifyTwoFactor(Verify2FaDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return BadRequest("Invalid user.");

            var isValid = await _userManager.VerifyTwoFactorTokenAsync(
                user, TokenOptions.DefaultEmailProvider, dto.Code);
            if (!isValid)
                return BadRequest("Invalid 2FA code.");

            user.LastLoginDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var roles = await _userManager.GetRolesAsync(user);
            var token = _jwtService.GenerateToken(user, roles);
            var refreshTokenEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                Token = Guid.NewGuid().ToString("N"),
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                UserId = user.Id
            };
            _context.RefreshTokens.Add(refreshTokenEntity);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                token,
                refreshToken = refreshTokenEntity.Token,
                user = new { user.Id, user.Email, user.FullName, role = roles.FirstOrDefault() }
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
            await _auditService.LogAsync("VerifyEmailOTP", $"User {user?.Email} verified email.");
            return Ok(new { message = "Verified successfully" });
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> Refresh([FromBody] RefreshRequestDto dto)
        {
            var existing = await _context.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == dto.RefreshToken);
            if (existing == null || existing.IsRevoked || existing.ExpiresAt < DateTime.UtcNow)
                return Unauthorized("Invalid or expired refresh token.");

            existing.IsRevoked = true;
            var roles = await _userManager.GetRolesAsync(existing.User!);
            var newJwt = _jwtService.GenerateToken(existing.User!, roles);
            var newRefresh = new RefreshToken
            {
                Id = Guid.NewGuid(),
                Token = Guid.NewGuid().ToString("N"),
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                UserId = existing.UserId
            };
            _context.RefreshTokens.Add(newRefresh);
            await _context.SaveChangesAsync();
            await _auditService.LogAsync("RefreshToken", $"Refresh token used for {existing.User?.Email}");
            return Ok(new { token = newJwt, refreshToken = newRefresh.Token });
        }

        [HttpPost("request-reset")]
        public async Task<IActionResult> RequestPasswordReset([FromBody] RequestResetDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null) return NotFound("Email not found.");

            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebUtility.UrlEncode(resetToken);
            var resetLink = $"{Request.Scheme}://{Request.Host}/reset-password.html?email={dto.Email}&token={encodedToken}";


            await _emailService.SendAsync(
                dto.Email,
                "Reset your password",
                $"Click here to reset your password: <a href=\"{resetLink}\">Reset Link</a>"
            );
            await _auditService.LogAsync("RequestPasswordReset", $"Password reset requested for {user.Email}");
            return Ok(new { message = "Password reset email sent." });
        }

        public class RequestResetDto
        {
            public string Email { get; set; } = string.Empty;
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null) return NotFound("No user found with that email.");

            var decodedToken = WebUtility.UrlDecode(dto.Token);
            var result = await _userManager.ResetPasswordAsync(user, decodedToken, dto.NewPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return BadRequest(errors);
            }
            await _auditService.LogAsync("ResetPassword", $"Password reset completed for {user.Email}");
            return Ok(new { message = "Password has been reset successfully." });
        }
    }
}
