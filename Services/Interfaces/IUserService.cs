using NjalaAPI.DTOs;
using NjalaAPI.DTOs.User;

namespace NjalaAPI.Services.Interfaces
{
    public interface IUserService
    {
        Task<PaginatedResultDto<UserDto>> GetAllUsersAsync(int page, int pageSize, string? search = null, string? role = null);
        Task<UserDto?> GetUserByIdAsync(Guid id);
        Task<UserDto> CreateUserAsync(CreateUserDto dto);
        Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto dto);
        Task<bool> DeleteUserAsync(Guid id);
        Task<byte[]> ExportUsersToCsvAsync();
    }
}
