using AutoMapper;
using CarService.Application.DTOs.User.CreateUser;
using CarService.Application.DTOs.User.GetUser;
using CarService.Application.DTOs.User.UpdateUser;
using CarService.Application.Exceptions;
using CarService.Domain.Abstractions;
using CarService.Infrastructure;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services.Imp
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<UserService> _logger;

        public UserService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<UserService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<MasterCreatedResponseDto> CreateMasterAsync(CreateMasterDto createDto)
        {
            if (await _unitOfWork.Users.AnyAsync(u => u.Email == createDto.Email))
                throw new BadRequestException("This email address is already in use.");

            var masterRole = await _unitOfWork.Roles.GetFirstOrDefaultAsync(r => r.Name == "Майстер");
            if (masterRole == null)
                throw new NotFoundException("Role 'Master' was not found in the database.");

            string temporaryPassword = GenerateLogicalPassword(createDto.FullName);

            var user = new User
            {
                FullName = createDto.FullName,
                Email = createDto.Email,
                Phone = createDto.Phone,
                RoleId = masterRole.Id,
                IsActive = true,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(temporaryPassword)
            };

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("New master created: {Email} (ID: {Id})", user.Email, user.Id);

            return new MasterCreatedResponseDto(user.Email, temporaryPassword);
        }

        public async Task<UserDto?> GetByIdAsync(int id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);

            if (user == null)
                throw new NotFoundException($"User with ID {id} was not found.");

            return _mapper.Map<UserDto>(user);
        }

        public async Task<IEnumerable<UserDto>> GetUsersByRoleAsync(string roleName)
        {
            var users = await _unitOfWork.Users.GetAsync(u => u.Role.Name == roleName);
            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        public async Task<IEnumerable<UserDto>> GetActiveUsersByRoleAsync(string roleName)
        {
            var users = await _unitOfWork.Users.GetAsync(u => u.Role.Name == roleName && u.IsActive == true);
            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        public async Task UpdateUserAsync(UserUpdateDto updateDto)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(updateDto.Id);

            if (user == null)
                throw new NotFoundException($"Cannot update: user with ID {updateDto.Id} was not found.");

            _mapper.Map(updateDto, user);
            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("User data for ID {Id} has been updated.", user.Id);
        }

        public async Task DeleteUserAsync(int id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);

            if (user == null)
                throw new NotFoundException($"Cannot delete: user with ID {id} was not found.");

            _unitOfWork.Users.Delete(user);
            await _unitOfWork.CompleteAsync();

            _logger.LogWarning("User {Email} (ID: {Id}) has been deleted from the system.", user.Email, user.Id);
        }

        public async Task ToggleStatusAsync(int id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);

            if (user == null)
                throw new NotFoundException($"User with ID {id} was not found.");

            user.IsActive = !user.IsActive;

            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Status for user {Id} changed to Active = {Status}.", user.Id, user.IsActive);
        }

        private string GenerateLogicalPassword(string fullName)
        {
            string lastName = fullName.Trim().Split(' ')[0];
            string formattedName = char.ToUpper(lastName[0]) + lastName.Substring(1).ToLower();
            int year = DateTime.Now.Year;

            return $"{formattedName}{year}";
        }
    }
}