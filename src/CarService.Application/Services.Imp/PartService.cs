using AutoMapper;
using CarService.Application.DTOs.Part.CreatePart;
using CarService.Application.DTOs.Part.GetPart;
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
    public class PartService : IPartService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<PartService> _logger;

        public PartService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<PartService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<PartDto>> GetAllAsync()
        {
            var parts = await _unitOfWork.Parts.GetAsync(p => true);
            return _mapper.Map<IEnumerable<PartDto>>(parts);
        }

        public async Task<PartDto> GetByIdAsync(int id)
        {
            var part = await _unitOfWork.Parts.GetByIdAsync(id);
            if (part == null) throw new NotFoundException($"Part with ID {id} was not found.");
            return _mapper.Map<PartDto>(part);
        }

        public async Task<IEnumerable<PartDto>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm)) return await GetAllAsync();

            var term = searchTerm.Trim().ToLower();
            var parts = await _unitOfWork.Parts.GetAsync(p =>
                p.Name.ToLower().Contains(term) ||
                (p.Sku != null && p.Sku.ToLower().Contains(term)));

            _logger.LogInformation("Part search executed for: '{Term}'. Found {Count} items.", searchTerm, parts.Count());
            return _mapper.Map<IEnumerable<PartDto>>(parts);
        }

        public async Task<IEnumerable<PartDto>> GetByCategoryAsync(int categoryId)
        {
            var categoryExists = await _unitOfWork.PartCategories.AnyAsync(c => c.Id == categoryId);
            if (!categoryExists)
            {
                throw new NotFoundException($"Part category with ID {categoryId} was not found.");
            }

            var parts = await _unitOfWork.Parts.GetAsync(p => p.CategoryId == categoryId);

            _logger.LogInformation("Retrieved {Count} parts for category ID {CategoryId}.", parts.Count(), categoryId);

            return _mapper.Map<IEnumerable<PartDto>>(parts);
        }

        public async Task<IEnumerable<PartDto>> GetByManufacturerAsync(int manufacturerId)
        {
            var manufacturerExists = await _unitOfWork.Manufacturers.AnyAsync(m => m.Id == manufacturerId);
            if (!manufacturerExists)
            {
                throw new NotFoundException($"Manufacturer with ID {manufacturerId} was not found.");
            }

            var parts = await _unitOfWork.Parts.GetAsync(p => p.ManufacturerId == manufacturerId);

            _logger.LogInformation("Retrieved {Count} parts for manufacturer ID {ManufacturerId}.", parts.Count(), manufacturerId);

            return _mapper.Map<IEnumerable<PartDto>>(parts);
        }

        public async Task<IEnumerable<PartDto>> GetLowStockAsync(decimal threshold)
        {
            var parts = await _unitOfWork.Parts.GetAsync(p => p.Quantity <= threshold);

            _logger.LogInformation("Low stock report generated with threshold {Threshold}. Found {Count} items.",
                threshold, parts.Count());

            return _mapper.Map<IEnumerable<PartDto>>(parts);
        }

        public async Task AdjustQuantityAsync(int id, decimal amount)
        {
            var part = await _unitOfWork.Parts.GetByIdAsync(id);
            if (part == null)
                throw new NotFoundException($"Part with ID {id} was not found.");

            // Перевірка на від'ємний результат
            if (part.Quantity + amount < 0)
            {
                _logger.LogWarning("Attempt to set negative quantity for Part ID {Id}. Current: {Current}, Adjustment: {Adjustment}",
                    id, part.Quantity, amount);
                throw new BadRequestException("Insufficient stock. The resulting quantity cannot be negative.");
            }

            part.Quantity += amount;

            _unitOfWork.Parts.Update(part);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Inventory adjusted for Part ID {Id}. Amount changed by {Amount}. New quantity: {NewQuantity}",
                id, amount, part.Quantity);
        }

        public async Task CreateAsync(CreatePartDto dto)
        {
            PartCategory? category = null;
            if (dto.CategoryId.HasValue)
            {
                category = await _unitOfWork.PartCategories.GetByIdAsync(dto.CategoryId.Value);
                if (category == null) throw new NotFoundException("Selected category was not found.");
            }
            else if (!string.IsNullOrWhiteSpace(dto.CategoryName))
            {
                category = await _unitOfWork.PartCategories.GetFirstOrDefaultAsync(c => c.Name.ToLower() == dto.CategoryName.Trim().ToLower());
                if (category == null)
                {
                    category = new PartCategory { Name = dto.CategoryName.Trim() };
                    await _unitOfWork.PartCategories.AddAsync(category);
                    _logger.LogInformation("New category '{Name}' created during part addition.", category.Name);
                }
            }

            Manufacturer? manufacturer = null;
            if (dto.ManufacturerId.HasValue)
            {
                manufacturer = await _unitOfWork.Manufacturers.GetByIdAsync(dto.ManufacturerId.Value);
                if (manufacturer == null) throw new NotFoundException("Selected manufacturer was not found.");
            }
            else if (!string.IsNullOrWhiteSpace(dto.ManufacturerName))
            {
                manufacturer = await _unitOfWork.Manufacturers.GetFirstOrDefaultAsync(m => m.Name.ToLower() == dto.ManufacturerName.Trim().ToLower());
                if (manufacturer == null)
                {
                    manufacturer = new Manufacturer { Name = dto.ManufacturerName.Trim() };
                    await _unitOfWork.Manufacturers.AddAsync(manufacturer);
                    _logger.LogInformation("New manufacturer '{Name}' created during part addition.", manufacturer.Name);
                }
            }

            if (category == null || manufacturer == null)
                throw new BadRequestException("Category and Manufacturer information is required.");

            var part = new Part
            {
                Name = dto.Name,
                Sku = dto.Sku,
                Quantity = dto.Quantity,
                PurchasePrice = dto.PurchasePrice,
                SellingPrice = dto.SellingPrice,
                Category = category,
                Manufacturer = manufacturer
            };

            await _unitOfWork.Parts.AddAsync(part);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Part '{PartName}' (SKU: {Sku}) added to warehouse.", part.Name, part.Sku);
        }

        public async Task UpdateAsync(int id, CreatePartDto dto)
        {
            var part = await _unitOfWork.Parts.GetByIdAsync(id);
            if (part == null) throw new NotFoundException($"Part with ID {id} not found.");

            _mapper.Map(dto, part);
            _unitOfWork.Parts.Update(part);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Part ID {Id} updated successfully.", id);
        }

        public async Task DeleteAsync(int id)
        {
            var part = await _unitOfWork.Parts.GetByIdAsync(id);
            if (part == null) throw new NotFoundException($"Part with ID {id} not found.");

            _unitOfWork.Parts.Delete(part);
            await _unitOfWork.CompleteAsync();

            _logger.LogWarning("Part '{Name}' (ID: {Id}) was removed from warehouse.", part.Name, id);
        }
    }
}
