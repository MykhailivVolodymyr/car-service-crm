using AutoMapper;
using CarService.Application.DTOs.VehicleModel.CreateVehicleModel;
using CarService.Application.DTOs.VehicleModel.GetVehicleModel;
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
    public class VehicleModelService : IVehicleModelService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<VehicleModelService> _logger;

        public VehicleModelService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<VehicleModelService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<VehicleModelDto>> GetAllAsync()
        {
            var models = await _unitOfWork.VehicleModels.GetAllAsync();
            return _mapper.Map<IEnumerable<VehicleModelDto>>(models);
        }

        public async Task<VehicleModelDto> GetByIdAsync(int id)
        {
            var model = await _unitOfWork.VehicleModels.GetByIdAsync(id);
            if (model == null)
            {
                throw new NotFoundException($"Модель з ID {id} не знайдена.");
            }
            return _mapper.Map<VehicleModelDto>(model);
        }

        public async Task<IEnumerable<VehicleModelDto>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return await GetAllAsync();
            }

            var term = searchTerm.Trim().ToLower();

            var models = await _unitOfWork.VehicleModels.GetAsync(m =>
                m.Name.ToLower().Contains(term) || m.Brand.Name.ToLower().Contains(term));

            _logger.LogInformation("Vehicle model search executed for: '{Term}'. Found {Count} results.", searchTerm, models.Count());

            return _mapper.Map<IEnumerable<VehicleModelDto>>(models);
        }

        public async Task<VehicleModelDto> CreateAsync(CreateVehicleModelDto dto)
        {
            VehicleBrand? brand = null;

            if (dto.BrandId.HasValue)
            {
                brand = await _unitOfWork.VehicleBrands.GetByIdAsync(dto.BrandId.Value);
                if (brand == null)
                    throw new NotFoundException($"Бренд з ID {dto.BrandId} не знайдено.");
            }
            else if (!string.IsNullOrWhiteSpace(dto.BrandName))
            {
                brand = await _unitOfWork.VehicleBrands
                    .GetFirstOrDefaultAsync(b => b.Name.ToLower() == dto.BrandName.Trim().ToLower());

                if (brand == null)
                {
                    brand = new VehicleBrand { Name = dto.BrandName.Trim() };
                    await _unitOfWork.VehicleBrands.AddAsync(brand);
                    _logger.LogInformation("New vehicle brand '{BrandName}' created during model creation.", brand.Name);
                }
            }
            else
            {
                throw new BadRequestException("Необхідно вказати ID бренду або його назву.");
            }

            var modelNameNormalized = dto.ModelName.Trim().ToLower();
            var existingModel = await _unitOfWork.VehicleModels
                .GetFirstOrDefaultAsync(m => m.Name.ToLower() == modelNameNormalized && m.BrandId == brand.Id);

            if (existingModel != null)
                throw new BadRequestException($"Модель '{dto.ModelName.Trim()}' вже існує для бренду '{brand.Name}'.");

            var vehicleModel = new VehicleModel
            {
                Name = dto.ModelName.Trim(),
                Brand = brand
            };

            await _unitOfWork.VehicleModels.AddAsync(vehicleModel);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("New vehicle model created: '{ModelName}' (ID: {Id}) for brand '{BrandName}'",
                vehicleModel.Name, vehicleModel.Id, brand.Name);

            var result = await _unitOfWork.VehicleModels.GetByIdAsync(vehicleModel.Id);
            return _mapper.Map<VehicleModelDto>(result);
        }

        public async Task UpdateAsync(int id, CreateVehicleModelDto dto)
        {
            var model = await _unitOfWork.VehicleModels.GetByIdAsync(id);
            if (model == null)
            {
                throw new NotFoundException($"Модель з ID {id} не знайдена.");
            }

            model.Name = dto.ModelName.Trim();
            _unitOfWork.VehicleModels.Update(model);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Model ID {Id} updated to '{Name}'.", id, model.Name);
        }

        public async Task DeleteAsync(int id)
        {
            var model = await _unitOfWork.VehicleModels.GetByIdAsync(id);
            if (model == null)
            {
                throw new NotFoundException($"Модель з ID {id} не знайдена.");
            }

            // if (await _unitOfWork.Vehicles.AnyAsync(v => v.ModelId == id))
            //    throw new BadRequestException("Неможливо видалити модель, оскільки вона пов'язана з автомобілями.");

            _unitOfWork.VehicleModels.Delete(model);
            await _unitOfWork.CompleteAsync();

            _logger.LogWarning("Model '{Name}' (ID: {Id}) was deleted.", model.Name, id);
        }

        public async Task<IEnumerable<VehicleModelDto>> GetByBrandAsync(int brandId)
        {
            var models = await _unitOfWork.VehicleModels.GetAsync(m => m.BrandId == brandId);
            return _mapper.Map<IEnumerable<VehicleModelDto>>(models);
        }
    }
}
