using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NjalaAPI.Models;
using NjalaAPI.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace NjalaAPI.Services
{
    public class JwtTokenService : IJwtTokenService
    {
        private readonly IConfiguration _config;

        public JwtTokenService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateToken(ApplicationUser user, IList<string> roles)
        {
            var mainRole = roles.FirstOrDefault() ?? "Student"; // Default role fallback

            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),    // User ID
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),     // Email
                new Claim(ClaimTypes.Name, user.FullName ?? string.Empty),   // Full Name for .NET
                new Claim("uid", user.Id.ToString()),
                new Claim("id", user.Id.ToString()),
                new Claim("FullName", user.FullName ?? string.Empty),        // Custom Full Name
                new Claim("role", mainRole),                                  // For frontend decoding
                new Claim(ClaimTypes.Role, mainRole),                         // For .NET role auth
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // JWT ID
            };

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                expires: DateTime.UtcNow.AddHours(5),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
