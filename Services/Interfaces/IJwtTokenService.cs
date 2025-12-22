using NjalaAPI.Models;


namespace NjalaAPI.Services.Interfaces
{
    public interface IJwtTokenService
    {
        string GenerateToken(ApplicationUser user, IList<string> roles);
    }
}
