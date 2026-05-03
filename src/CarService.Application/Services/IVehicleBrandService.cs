using CarService.Application.DTOs.VehicleBrand.CreateVehicleBrand;
using CarService.Application.DTOs.VehicleBrand.GetVehicleBrand;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services
{
    public interface IVehicleBrandService
    {
        Task<IEnumerable<VehicleBrandDto>> GetAllAsync();
        Task<VehicleBrandDto> GetByIdAsync(int id);
        Task<IEnumerable<VehicleBrandDto>> SearchAsync(string searchTerm);
        Task<VehicleBrandDto> CreateAsync(CreateVehicleBrandDto dto);
        Task UpdateAsync(int id, CreateVehicleBrandDto dto);
        Task DeleteAsync(int id);
    }
}
