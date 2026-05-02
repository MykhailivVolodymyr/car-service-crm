using CarService.Application.DTOs.User.Auth;
using CarService.Application.Exceptions;
using CarService.Domain.Abstractions;
using CarService.Infrastructure;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services.Imp
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(IUnitOfWork unitOfWork, ILogger<AuthService> logger, ITokenService tokenService)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _tokenService = tokenService;
        }

        public async Task RegisterManagerAsync(RegisterRequestDto request)
        {
            _logger.LogInformation("Attempting to register a new manager with login: {Login}", request.Login);

            if (await _unitOfWork.Users.AnyAsync(u => u.Login == request.Login))
            {
                _logger.LogWarning("Registration failed: User with login {Login} already exists", request.Login);
                throw new BadRequestException("User with this login already exists.");
            }

            var managerRole = await _unitOfWork.Roles.GetFirstOrDefaultAsync(r => r.Name == "Менеджер");
            if (managerRole == null)
            {
                _logger.LogCritical("Critical Error: 'Менеджер' role not found in the database. Check SeedData.");
                throw new NotFoundException("Required system role 'Менеджер' is missing in the database.");
            }

            var user = new User
            {
                FullName = request.FullName,
                Login = request.Login,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Phone = request.Phone,
                RoleId = managerRole.Id,
                IsActive = true
            };

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Manager {Login} successfully registered with ID: {Id}", user.Login, user.Id);
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            _logger.LogInformation("Login attempt for user: {Login}", request.Login);

            var user = await _unitOfWork.Users.GetFirstOrDefaultAsync(u => u.Login == request.Login);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                _logger.LogWarning("Invalid login attempt for user: {Login}", request.Login);
                throw new BadRequestException("Invalid login or password.");
            }

            var userRole = await _unitOfWork.Roles.GetByIdAsync(user.RoleId);
            var roleName = userRole?.Name ?? "Unknown";

            var token = _tokenService.CreateToken(user, roleName);

            _logger.LogInformation("User {Login} successfully authenticated with role {Role}", request.Login, roleName);

            return new AuthResponseDto(token, user.FullName, roleName);
        }
    }
}
