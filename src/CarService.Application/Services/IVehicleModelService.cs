using CarService.Application.DTOs.VehicleModel.CreateVehicleModel;
using CarService.Application.DTOs.VehicleModel.GetVehicleModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services
{
    public interface IVehicleModelService
    {
        Task<IEnumerable<VehicleModelDto>> GetAllAsync();
        Task<VehicleModelDto> GetByIdAsync(int id);
        Task<IEnumerable<VehicleModelDto>> GetByBrandAsync(int brandId);
        Task<IEnumerable<VehicleModelDto>> SearchAsync(string searchTerm);
        Task<VehicleModelDto> CreateAsync(CreateVehicleModelDto dto);
        Task UpdateAsync(int id, CreateVehicleModelDto dto);
        Task DeleteAsync(int id);
    }
}
