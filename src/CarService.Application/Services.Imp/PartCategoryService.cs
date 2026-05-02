using AutoMapper;
using CarService.Application.DTOs.PartCategory.CreatePartCategory;
using CarService.Application.DTOs.PartCategory.GetPartCategory;
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
    public class PartCategoryService : IPartCategoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<PartCategoryService> _logger;

        public PartCategoryService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<PartCategoryService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<PartCategoryDto>> GetAllAsync()
        {
            var categories = await _unitOfWork.PartCategories.GetAllAsync();
            return _mapper.Map<IEnumerable<PartCategoryDto>>(categories);
        }

        public async Task<PartCategoryDto> GetByIdAsync(int id)
        {
            var category = await _unitOfWork.PartCategories.GetByIdAsync(id);
            if (category == null)
                throw new NotFoundException($"Part category with ID {id} was not found.");

            return _mapper.Map<PartCategoryDto>(category);
        }

        public async Task<PartCategoryDto> CreateAsync(CreatePartCategoryDto dto)
        {
            if (await _unitOfWork.PartCategories.AnyAsync(c => c.Name == dto.Name))
                throw new BadRequestException($"Part category with name '{dto.Name}' already exists.");

            var category = _mapper.Map<PartCategory>(dto);
            await _unitOfWork.PartCategories.AddAsync(category);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("New part category created: {CategoryName} (ID: {Id})", category.Name, category.Id);

            return _mapper.Map<PartCategoryDto>(category);
        }

        public async Task UpdateAsync(int id, CreatePartCategoryDto dto)
        {
            var category = await _unitOfWork.PartCategories.GetByIdAsync(id);
            if (category == null)
                throw new NotFoundException($"Cannot update: part category with ID {id} was not found.");

            string oldName = category.Name;

            if (category.Name != dto.Name && await _unitOfWork.PartCategories.AnyAsync(c => c.Name == dto.Name))
                throw new BadRequestException($"Part category with name '{dto.Name}' already exists.");

            _mapper.Map(dto, category);
            _unitOfWork.PartCategories.Update(category);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Part category ID {Id} updated. Old name: '{OldName}', New name: '{NewName}'",
                id, oldName, dto.Name);
        }

        public async Task DeleteAsync(int id)
        {
            var category = await _unitOfWork.PartCategories.GetByIdAsync(id);
            if (category == null)
                throw new NotFoundException($"Cannot delete: part category with ID {id} was not found.");

            //var hasParts = await _unitOfWork.Parts.AnyAsync(p => p.CategoryId == id);
            //if (hasParts)
            //    throw new BadRequestException("Cannot delete a category that contains spare parts.");

            string categoryName = category.Name;
            _unitOfWork.PartCategories.Delete(category);
            await _unitOfWork.CompleteAsync();

            _logger.LogWarning("Part category '{CategoryName}' (ID: {Id}) was deleted.", categoryName, id);
        }
    }
}
