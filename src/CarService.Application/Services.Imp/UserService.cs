using AutoMapper;
using CarService.Application.DTOs.User.CreateUser;
using CarService.Application.DTOs.User.GetUser;
using CarService.Application.DTOs.User.UpdateUser;
using CarService.Application.Exceptions;
using CarService.Domain.Abstractions;
using CarService.Infrastructure;
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

        public UserService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<MasterCreatedResponseDto> CreateMasterAsync(CreateMasterDto createDto)
        {
            if (await _unitOfWork.Users.AnyAsync(u => u.Email == createDto.Email))
                throw new BadRequestException("Цей Email вже зайнятий.");

            var masterRole = await _unitOfWork.Roles.GetFirstOrDefaultAsync(r => r.Name == "Майстер");
            if (masterRole == null)
                throw new NotFoundException("Роль 'Майстер' не знайдена в БД.");

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

            return new MasterCreatedResponseDto(user.Email, temporaryPassword);
        }

        public async Task<UserDto?> GetByIdAsync(int id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);

            if (user == null)
                throw new NotFoundException($"Користувача з ID {id} не знайдено.");

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
                throw new NotFoundException($"Неможливо оновити: користувача з ID {updateDto.Id} не знайдено.");

            _mapper.Map(updateDto, user);

            _unitOfWork.Users.Update(user);

            await _unitOfWork.CompleteAsync();
       
        }

        public async Task DeleteUserAsync(int id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);

            if (user == null)
                throw new NotFoundException($"Неможливо видалити: користувача з ID {id} не знайдено.");

            _unitOfWork.Users.Delete(user);

            await _unitOfWork.CompleteAsync();
        }

        public async Task ToggleStatusAsync(int id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);

            if (user == null)
                throw new NotFoundException($"Користувача з ID {id} не знайдено.");

            user.IsActive = !user.IsActive;

            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();
        }

        private string GenerateLogicalPassword(string fullName)
        {
            // Беремо перше слово з ПІБ (наприклад, "Бондаренко")
            string lastName = fullName.Trim().Split(' ')[0];

            // Робимо першу літеру великою, інші — маленькими (Capitalize)
            string formattedName = char.ToUpper(lastName[0]) + lastName.Substring(1).ToLower();

            // Додаємо поточний рік
            int year = DateTime.Now.Year;

            return $"{formattedName}{year}";
        }
    }
}
