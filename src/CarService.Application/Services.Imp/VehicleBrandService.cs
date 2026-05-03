using AutoMapper;
using CarService.Application.DTOs.VehicleBrand.CreateVehicleBrand;
using CarService.Application.DTOs.VehicleBrand.GetVehicleBrand;
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
    public class VehicleBrandService : IVehicleBrandService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<VehicleBrandService> _logger;

        public VehicleBrandService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<VehicleBrandService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<VehicleBrandDto>> GetAllAsync()
        {
            var brands = await _unitOfWork.VehicleBrands.GetAllAsync();
            return _mapper.Map<IEnumerable<VehicleBrandDto>>(brands);
        }

        public async Task<VehicleBrandDto> GetByIdAsync(int id)
        {
            var brand = await _unitOfWork.VehicleBrands.GetByIdAsync(id);
            if (brand == null) throw new NotFoundException($"Brand with ID {id} not found.");
            return _mapper.Map<VehicleBrandDto>(brand);
        }

        public async Task<IEnumerable<VehicleBrandDto>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm)) return await GetAllAsync();

            var brands = await _unitOfWork.VehicleBrands.GetAsync(b =>
                b.Name.ToLower().Contains(searchTerm.Trim().ToLower()));

            return _mapper.Map<IEnumerable<VehicleBrandDto>>(brands);
        }

        public async Task<VehicleBrandDto> CreateAsync(CreateVehicleBrandDto dto)
        {
            if (await _unitOfWork.VehicleBrands.AnyAsync(b => b.Name.ToLower() == dto.Name.Trim().ToLower()))
                throw new BadRequestException($"Brand '{dto.Name}' already exists.");

            var brand = _mapper.Map<VehicleBrand>(dto);
            await _unitOfWork.VehicleBrands.AddAsync(brand);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Vehicle brand '{Name}' created with ID {Id}.", brand.Name, brand.Id);
            return _mapper.Map<VehicleBrandDto>(brand);
        }

        public async Task UpdateAsync(int id, CreateVehicleBrandDto dto)
        {
            var brand = await _unitOfWork.VehicleBrands.GetByIdAsync(id);
            if (brand == null) throw new NotFoundException($"Brand with ID {id} not found.");

            if (await _unitOfWork.VehicleBrands.AnyAsync(b => b.Name.ToLower() == dto.Name.Trim().ToLower() && b.Id != id))
                throw new BadRequestException("Another brand with this name already exists.");

            brand.Name = dto.Name.Trim();
            _unitOfWork.VehicleBrands.Update(brand);
            await _unitOfWork.CompleteAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var brand = await _unitOfWork.VehicleBrands.GetByIdAsync(id);
            if (brand == null) throw new NotFoundException($"Brand with ID {id} not found.");

            //var hasModels = await _unitOfWork.VehicleModels.AnyAsync(m => m.BrandId == id);
            //if (hasModels)
            //    throw new BadRequestException("Cannot delete brand because it has associated vehicle models.");

            _unitOfWork.VehicleBrands.Delete(brand);
            await _unitOfWork.CompleteAsync();
            _logger.LogWarning("Vehicle brand '{Name}' (ID: {Id}) was deleted.", brand.Name, id);
        }
    }
}
