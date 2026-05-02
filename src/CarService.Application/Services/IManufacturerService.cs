using CarService.Application.DTOs.Manufacturer.CreateManufacturer;
using CarService.Application.DTOs.Manufacturer.GetManufacturer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services
{
    public interface IManufacturerService
    {
        Task<IEnumerable<ManufacturerDto>> GetAllAsync();
        Task<ManufacturerDto> GetByIdAsync(int id);
        Task<ManufacturerDto> CreateAsync(CreateManufacturerDto dto);
        Task UpdateAsync(int id, CreateManufacturerDto dto);
        Task DeleteAsync(int id);
    }
}
