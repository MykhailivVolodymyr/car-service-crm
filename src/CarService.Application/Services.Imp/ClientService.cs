using AutoMapper;
using CarService.Application.DTOs.Client.CreateClient;
using CarService.Application.DTOs.Client.GetClient;
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
    public class ClientService : IClientService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<ClientService> _logger;

        public ClientService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<ClientService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<ClientDto>> GetAllAsync()
        {
            var clients = await _unitOfWork.Clients.GetAllAsync();
            return _mapper.Map<IEnumerable<ClientDto>>(clients);
        }

        public async Task<ClientDto> GetByIdAsync(int id)
        {
            var client = await _unitOfWork.Clients.GetByIdAsync(id);
            if (client == null)
                throw new NotFoundException($"Client with ID {id} was not found.");

            return _mapper.Map<ClientDto>(client);
        }

        public async Task<IEnumerable<ClientDto>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm)) return await GetAllAsync();

            var term = searchTerm.Trim().ToLower();
            var clients = await _unitOfWork.Clients.GetAsync(c =>
                c.FullName.ToLower().Contains(term) || c.Phone.Contains(term));

            _logger.LogInformation("Client search executed for: '{Term}'. Found {Count} results.", searchTerm, clients.Count());
            return _mapper.Map<IEnumerable<ClientDto>>(clients);
        }

        public async Task<ClientDto> CreateAsync(CreateClientDto dto)
        {
            if (await _unitOfWork.Clients.AnyAsync(c => c.Phone == dto.Phone))
                throw new BadRequestException($"Client with phone number {dto.Phone} already exists.");

            var client = _mapper.Map<Client>(dto);
            await _unitOfWork.Clients.AddAsync(client);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("New client registered: {FullName} (ID: {Id})", client.FullName, client.Id);
            return _mapper.Map<ClientDto>(client);
        }

        public async Task UpdateAsync(int id, CreateClientDto dto)
        {
            var client = await _unitOfWork.Clients.GetByIdAsync(id);
            if (client == null)
                throw new NotFoundException($"Client with ID {id} was not found.");

            if (client.Phone != dto.Phone && await _unitOfWork.Clients.AnyAsync(c => c.Phone == dto.Phone))
                throw new BadRequestException("This phone number is already assigned to another client.");

            _mapper.Map(dto, client);
            _unitOfWork.Clients.Update(client);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Client info updated for ID {Id}.", id);
        }

        public async Task DeleteAsync(int id)
        {
            var client = await _unitOfWork.Clients.GetByIdAsync(id);
            if (client == null)
                throw new NotFoundException($"Client with ID {id} was not found.");

            //// Перевірка наявності автомобілів перед видаленням
            //var hasVehicles = await _unitOfWork.Vehicles.AnyAsync(v => v.ClientId == id);
            //if (hasVehicles)
            //    throw new BadRequestException("Cannot delete client because they have associated vehicles.");

            _unitOfWork.Clients.Delete(client);
            await _unitOfWork.CompleteAsync();

            _logger.LogWarning("Client {FullName} (ID: {Id}) was removed from the system.", client.FullName, id);
        }
    }
}
