using AutoMapper;
using CarService.Application.DTOs.Service.CreateService;
using CarService.Application.DTOs.Service.GetService;
using CarService.Application.DTOs.Service.UpdateService;
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
    public class ServiceAppService : IServiceAppService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<ServiceAppService> _logger;

        public ServiceAppService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<ServiceAppService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<ServiceDto>> GetAllAsync()
        {
            var services = await _unitOfWork.Services.GetAsync(s => true);
            return _mapper.Map<IEnumerable<ServiceDto>>(services);
        }

        public async Task<ServiceDto> GetByIdAsync(int id)
        {
            var service = await _unitOfWork.Services.GetByIdAsync(id);
            if (service == null)
                throw new NotFoundException($"Service with ID {id} was not found.");

            return _mapper.Map<ServiceDto>(service);
        }

        public async Task<IEnumerable<ServiceDto>> GetByCategoryAsync(int categoryId)
        {
            var categoryExists = await _unitOfWork.ServiceCategories.AnyAsync(c => c.Id == categoryId);

            if (!categoryExists)
            {
                throw new NotFoundException($"Service category with ID {categoryId} was not found.");
            }

            var services = await _unitOfWork.Services.GetAsync(s => s.CategoryId == categoryId);

            return _mapper.Map<IEnumerable<ServiceDto>>(services);
        }

        public async Task<IEnumerable<ServiceDto>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                _logger.LogInformation("Search term was empty, returning all services.");
                return await GetAllAsync();
            }

            var term = searchTerm.Trim().ToLower();

            var services = await _unitOfWork.Services.GetAsync(s =>
                s.Name.ToLower().Contains(term) ||
                (s.Description != null && s.Description.ToLower().Contains(term)));

            _logger.LogInformation("Search executed for term: '{SearchTerm}'. Found {Count} results.",
                searchTerm, services.Count());

            return _mapper.Map<IEnumerable<ServiceDto>>(services);
        }

        public async Task CreateAsync(CreateServiceDto dto)
        {
            ServiceCategory? category = null;

            if (dto.CategoryId.HasValue)
            {
                category = await _unitOfWork.ServiceCategories.GetByIdAsync(dto.CategoryId.Value);
                if (category == null)
                    throw new NotFoundException($"Provided category ID {dto.CategoryId} was not found.");
            }
            else if (!string.IsNullOrWhiteSpace(dto.CategoryName))
            {
                category = await _unitOfWork.ServiceCategories
                    .GetFirstOrDefaultAsync(c => c.Name.ToLower() == dto.CategoryName.Trim().ToLower());

                if (category == null)
                {
                    category = new ServiceCategory { Name = dto.CategoryName.Trim() };
                    await _unitOfWork.ServiceCategories.AddAsync(category);
                    _logger.LogInformation("New service category '{CategoryName}' created during service creation.", category.Name);
                }
            }
            else
            {
                throw new BadRequestException("Either CategoryId or CategoryName must be provided.");
            }

            var service = new Service
            {
                Name = dto.Name,
                Description = dto.Description,
                DefaultPrice = dto.DefaultPrice,
                Category = category
            };

            await _unitOfWork.Services.AddAsync(service);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("New service created: '{ServiceName}' (ID: {Id}) in category '{CategoryName}'",
                service.Name, service.Id, category.Name);
        }

        public async Task UpdateAsync(UpdateServiceDto dto)
        {
            var service = await _unitOfWork.Services.GetByIdAsync(dto.Id);
            if (service == null)
                throw new NotFoundException($"Service with ID {dto.Id} was not found.");

            if (!await _unitOfWork.ServiceCategories.AnyAsync(c => c.Id == dto.CategoryId))
                throw new BadRequestException($"Provided category ID {dto.CategoryId} does not exist.");

            _mapper.Map(dto, service);
            _unitOfWork.Services.Update(service);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Service with ID {Id} was successfully updated.", dto.Id);
        }

        public async Task DeleteAsync(int id)
        {
            var service = await _unitOfWork.Services.GetByIdAsync(id);
            if (service == null)
                throw new NotFoundException($"Service with ID {id} was not found.");

            string serviceName = service.Name;
            _unitOfWork.Services.Delete(service);
            await _unitOfWork.CompleteAsync();

            _logger.LogWarning("Service '{ServiceName}' (ID: {Id}) was deleted from the system.", serviceName, id);
        }
    }
}