using AutoMapper;
using CarService.Application.DTOs.Manufacturer.CreateManufacturer;
using CarService.Application.DTOs.Manufacturer.GetManufacturer;
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
    public class ManufacturerService : IManufacturerService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<ManufacturerService> _logger;

        public ManufacturerService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<ManufacturerService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<ManufacturerDto>> GetAllAsync()
        {
            var manufacturers = await _unitOfWork.Manufacturers.GetAllAsync();
            return _mapper.Map<IEnumerable<ManufacturerDto>>(manufacturers);
        }

        public async Task<ManufacturerDto> GetByIdAsync(int id)
        {
            var manufacturer = await _unitOfWork.Manufacturers.GetByIdAsync(id);
            if (manufacturer == null)
                throw new NotFoundException($"Manufacturer with ID {id} was not found.");

            return _mapper.Map<ManufacturerDto>(manufacturer);
        }

        public async Task<ManufacturerDto> CreateAsync(CreateManufacturerDto dto)
        {
            if (await _unitOfWork.Manufacturers.AnyAsync(m => m.Name == dto.Name))
                throw new BadRequestException($"Manufacturer with name '{dto.Name}' already exists.");

            var manufacturer = _mapper.Map<Manufacturer>(dto);
            await _unitOfWork.Manufacturers.AddAsync(manufacturer);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("New manufacturer created: {ManufacturerName} (ID: {Id})", manufacturer.Name, manufacturer.Id);

            return _mapper.Map<ManufacturerDto>(manufacturer);
        }

        public async Task UpdateAsync(int id, CreateManufacturerDto dto)
        {
            var manufacturer = await _unitOfWork.Manufacturers.GetByIdAsync(id);
            if (manufacturer == null)
                throw new NotFoundException($"Cannot update: manufacturer with ID {id} was not found.");

            string oldName = manufacturer.Name;

            if (manufacturer.Name != dto.Name && await _unitOfWork.Manufacturers.AnyAsync(m => m.Name == dto.Name))
                throw new BadRequestException($"Manufacturer with name '{dto.Name}' already exists.");

            _mapper.Map(dto, manufacturer);
            _unitOfWork.Manufacturers.Update(manufacturer);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Manufacturer ID {Id} updated. Old name: '{OldName}', New name: '{NewName}'",
                id, oldName, dto.Name);
        }

        public async Task DeleteAsync(int id)
        {
            var manufacturer = await _unitOfWork.Manufacturers.GetByIdAsync(id);
            if (manufacturer == null)
                throw new NotFoundException($"Cannot delete: manufacturer with ID {id} was not found.");

            var hasParts = await _unitOfWork.Parts.AnyAsync(p => p.ManufacturerId == id);
            if (hasParts)
                throw new BadRequestException("Cannot delete a manufacturer that has associated parts in the warehouse.");

            string manufacturerName = manufacturer.Name;
            _unitOfWork.Manufacturers.Delete(manufacturer);
            await _unitOfWork.CompleteAsync();

            _logger.LogWarning("Manufacturer '{ManufacturerName}' (ID: {Id}) was deleted from the system", manufacturerName, id);
        }
    }
}
