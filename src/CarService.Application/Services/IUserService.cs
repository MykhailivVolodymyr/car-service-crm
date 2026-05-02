using CarService.Application.DTOs.User.CreateUser;
using CarService.Application.DTOs.User.GetUser;
using CarService.Application.DTOs.User.UpdateUser;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services
{
    public interface IUserService
    {
        Task<MasterCreatedResponseDto> CreateMasterAsync(CreateMasterDto createDto);
        Task<UserDto?> GetByIdAsync(int id);
        Task<IEnumerable<UserDto>> GetUsersByRoleAsync(string roleName);
        Task<IEnumerable<UserDto>> GetActiveUsersByRoleAsync(string roleName);
        Task UpdateUserAsync(UserUpdateDto updateDto);
        Task DeleteUserAsync(int id);
        Task ToggleStatusAsync(int id);
    }
}
