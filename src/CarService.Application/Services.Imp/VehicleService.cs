using AutoMapper;
using CarService.Application.DTOs.Vehicle.CreateVehicle;
using CarService.Application.DTOs.Vehicle.GetVehicle;
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
    public class VehicleService : IVehicleService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<VehicleService> _logger;

        public VehicleService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<VehicleService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<VehicleDto>> GetAllAsync()
        {
            var vehicles = await _unitOfWork.Vehicles.GetAllAsync();
            return _mapper.Map<IEnumerable<VehicleDto>>(vehicles);
        }

        public async Task<VehicleDto> GetByIdAsync(int id)
        {
            var vehicle = await _unitOfWork.Vehicles.GetByIdAsync(id);
            if (vehicle == null) throw new NotFoundException($"Автомобіль з ID {id} не знайдено.");
            return _mapper.Map<VehicleDto>(vehicle);
        }

        public async Task<VehicleDto> CreateAsync(CreateVehicleDto dto)
        {
            // 1. КЛІЄНТ: Знайти або створити
            Client? client = null;
            if (dto.ClientId.HasValue)
            {
                client = await _unitOfWork.Clients.GetByIdAsync(dto.ClientId.Value);
                if (client == null) throw new NotFoundException($"Клієнт з ID {dto.ClientId} не знайдений.");
            }
            else if (!string.IsNullOrWhiteSpace(dto.ClientPhone))
            {
                var phone = dto.ClientPhone.Trim();
                client = await _unitOfWork.Clients.GetFirstOrDefaultAsync(c => c.Phone == phone);

                if (client == null)
                {
                    client = new Client
                    {
                        FullName = dto.ClientFullName ?? "Новий Клієнт",
                        Phone = phone,
                        Email = dto.ClientEmail
                    };
                    await _unitOfWork.Clients.AddAsync(client);
                    _logger.LogInformation("Created new client '{Phone}' during vehicle registration.", phone);
                }
            }

            // 2. МОДЕЛЬ: Знайти або створити (разом із брендом)
            VehicleModel? model = null;
            if (dto.ModelId.HasValue)
            {
                model = await _unitOfWork.VehicleModels.GetByIdAsync(dto.ModelId.Value);
                if (model == null) throw new NotFoundException($"Модель з ID {dto.ModelId} не знайдена.");
            }
            else if (!string.IsNullOrWhiteSpace(dto.ModelName) && !string.IsNullOrWhiteSpace(dto.BrandName))
            {
                var bName = dto.BrandName.Trim();
                var brand = await _unitOfWork.VehicleBrands.GetFirstOrDefaultAsync(b => b.Name.ToLower() == bName.ToLower());
                if (brand == null)
                {
                    brand = new VehicleBrand { Name = bName };
                    await _unitOfWork.VehicleBrands.AddAsync(brand);
                }

                var mName = dto.ModelName.Trim();
                model = await _unitOfWork.VehicleModels.GetFirstOrDefaultAsync(m =>
                    m.Name.ToLower() == mName.ToLower() && m.BrandId == brand.Id);

                if (model == null)
                {
                    model = new VehicleModel { Name = mName, Brand = brand };
                    await _unitOfWork.VehicleModels.AddAsync(model);
                }
            }

            // 3. АВТО: Перевірка унікальності та створення
            var vin = dto.Vin.ToUpper().Trim();
            var plate = dto.LicensePlate.ToUpper().Trim();

            if (await _unitOfWork.Vehicles.AnyAsync(v => v.Vin == vin || v.LicensePlate == plate))
                throw new BadRequestException("Автомобіль з таким VIN або держномером вже існує в системі.");

            var vehicle = new Vehicle
            {
                Client = client,
                Model = model!,
                Vin = vin,
                LicensePlate = plate,
                Year = dto.Year
            };

            await _unitOfWork.Vehicles.AddAsync(vehicle);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Vehicle {Plate} registered for client {Client}.", vehicle.LicensePlate, client?.FullName ?? "Unknown");

            var result = await _unitOfWork.Vehicles.GetByIdAsync(vehicle.Id);
            return _mapper.Map<VehicleDto>(result);
        }

        public async Task<IEnumerable<VehicleDto>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return await GetAllAsync();
            }

            var term = searchTerm.Trim().ToLower();

            // Пошук за держномером, VIN, ім'ям власника або номером телефону
            var vehicles = await _unitOfWork.Vehicles.GetAsync(v =>
                v.LicensePlate.ToLower().Contains(term) ||
                v.Vin.ToLower().Contains(term) ||
                v.Client!.FullName.ToLower().Contains(term) ||
                v.Client.Phone.Contains(term));

            _logger.LogInformation("Vehicle search executed for term: '{Term}'. Found {Count} results.", term, vehicles.Count());

            return _mapper.Map<IEnumerable<VehicleDto>>(vehicles);
        }

        public async Task<VehicleDto?> GetByVinAsync(string vin)
        {
            if (string.IsNullOrWhiteSpace(vin)) return null;

            var normalizedVin = vin.Trim().ToUpper();
            var vehicle = await _unitOfWork.Vehicles.GetFirstOrDefaultAsync(v => v.Vin == normalizedVin);

            return vehicle != null ? _mapper.Map<VehicleDto>(vehicle) : null;
        }

        public async Task<VehicleDto?> GetByLicensePlateAsync(string licensePlate)
        {
            if (string.IsNullOrWhiteSpace(licensePlate)) return null;

            var normalizedPlate = licensePlate.Trim().ToUpper();
            var vehicle = await _unitOfWork.Vehicles.GetFirstOrDefaultAsync(v => v.LicensePlate == normalizedPlate);

            return vehicle != null ? _mapper.Map<VehicleDto>(vehicle) : null;
        }

        public async Task<bool> ExistsAsync(string vin, string licensePlate)
        {
            var normalizedVin = vin.Trim().ToUpper();
            var normalizedPlate = licensePlate.Trim().ToUpper();

            return await _unitOfWork.Vehicles.AnyAsync(v =>
                v.Vin == normalizedVin || v.LicensePlate == normalizedPlate);
        }
        public async Task<IEnumerable<VehicleDto>> GetByClientIdAsync(int clientId)
        {
            var vehicles = await _unitOfWork.Vehicles.GetAsync(v => v.ClientId == clientId);
            return _mapper.Map<IEnumerable<VehicleDto>>(vehicles);
        }

        public async Task UpdateAsync(int id, CreateVehicleDto dto)
        {
            var vehicle = await _unitOfWork.Vehicles.GetByIdAsync(id);
            if (vehicle == null) throw new NotFoundException($"Автомобіль ID {id} не знайдено.");

            vehicle.LicensePlate = dto.LicensePlate.ToUpper().Trim();
            vehicle.Year = dto.Year;
            vehicle.Vin = dto.Vin.ToUpper().Trim();

            _unitOfWork.Vehicles.Update(vehicle);
            await _unitOfWork.CompleteAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var vehicle = await _unitOfWork.Vehicles.GetByIdAsync(id);
            if (vehicle == null) throw new NotFoundException($"Автомобіль ID {id} не знайдено.");

            //var hasOrders = await _unitOfWork.Orders.AnyAsync(o => o.VehicleId == id);
            //if (hasOrders)
            //    throw new BadRequestException("Неможливо видалити автомобіль, оскільки він має історію замовлень.");

            _unitOfWork.Vehicles.Delete(vehicle);
            await _unitOfWork.CompleteAsync();
        }
    }
}
