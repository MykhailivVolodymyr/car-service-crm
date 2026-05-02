using AutoMapper;
using CarService.Application.DTOs.ServiceCategory.CreateServiceCategory;
using CarService.Application.DTOs.ServiceCategory.GetServiceCategory;
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
    public class ServiceCategoryService : IServiceCategoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<ServiceCategoryService> _logger;

        public ServiceCategoryService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<ServiceCategoryService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllAsync()
        {
            var categories = await _unitOfWork.ServiceCategories.GetAllAsync();
            return _mapper.Map<IEnumerable<CategoryDto>>(categories);
        }

        public async Task<CategoryDto> GetByIdAsync(int id)
        {
            var category = await _unitOfWork.ServiceCategories.GetByIdAsync(id);

            if (category == null)
                throw new NotFoundException($"Service category with ID {id} was not found.");

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
        {
            if (await _unitOfWork.ServiceCategories.AnyAsync(c => c.Name == dto.Name))
                throw new BadRequestException($"Service category with name '{dto.Name}' already exists.");

            var category = _mapper.Map<ServiceCategory>(dto);

            await _unitOfWork.ServiceCategories.AddAsync(category);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("New service category created: {CategoryName} (ID: {Id})", category.Name, category.Id);

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task UpdateAsync(int id, CreateCategoryDto dto)
        {
            var category = await _unitOfWork.ServiceCategories.GetByIdAsync(id);

            if (category == null)
                throw new NotFoundException($"Cannot update: service category with ID {id} was not found.");

            string oldName = category.Name;

            if (category.Name != dto.Name && await _unitOfWork.ServiceCategories.AnyAsync(c => c.Name == dto.Name))
                throw new BadRequestException($"Service category with name '{dto.Name}' already exists.");

            _mapper.Map(dto, category);
            _unitOfWork.ServiceCategories.Update(category);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Service category with ID {Id} updated. Old name: '{OldName}', New name: '{NewName}'",
                id, oldName, dto.Name);
        }

        public async Task DeleteAsync(int id)
        {
            var category = await _unitOfWork.ServiceCategories.GetByIdAsync(id);

            if (category == null)
                throw new NotFoundException($"Cannot delete: service category with ID {id} was not found.");

            var hasServices = await _unitOfWork.Services.AnyAsync(s => s.CategoryId == id);
            if (hasServices)
                throw new BadRequestException("Cannot delete a category that has associated services.");

            string categoryName = category.Name;
            _unitOfWork.ServiceCategories.Delete(category);
            await _unitOfWork.CompleteAsync();

            _logger.LogWarning("Service category '{CategoryName}' (ID: {Id}) was deleted from the system", categoryName, id);
        }
    }
}