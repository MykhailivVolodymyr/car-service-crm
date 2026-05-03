using CarService.Application.DTOs.Vehicle.CreateVehicle;
using CarService.Application.DTOs.Vehicle.GetVehicle;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services
{
    public interface IVehicleService
    {
        Task<IEnumerable<VehicleDto>> GetAllAsync();
        Task<VehicleDto> GetByIdAsync(int id);
        Task<IEnumerable<VehicleDto>> GetByClientIdAsync(int clientId);
        Task<IEnumerable<VehicleDto>> SearchAsync(string searchTerm);
        Task<VehicleDto?> GetByVinAsync(string vin);
        Task<VehicleDto?> GetByLicensePlateAsync(string licensePlate);
        Task<bool> ExistsAsync(string vin, string licensePlate);
        Task<VehicleDto> CreateAsync(CreateVehicleDto dto);
        Task UpdateAsync(int id, CreateVehicleDto dto);
        Task DeleteAsync(int id);
    }
}
