using CarService.Application.DTOs.Part.CreatePart;
using CarService.Application.DTOs.Part.GetPart;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services
{
    public interface IPartService
    {
        Task<IEnumerable<PartDto>> GetAllAsync();
        Task<PartDto> GetByIdAsync(int id);
        Task<IEnumerable<PartDto>> SearchAsync(string searchTerm);

        Task<IEnumerable<PartDto>> GetByCategoryAsync(int categoryId);
        Task<IEnumerable<PartDto>> GetByManufacturerAsync(int manufacturerId);

        Task<IEnumerable<PartDto>> GetLowStockAsync(decimal threshold);
        Task AdjustQuantityAsync(int id, decimal amount);

        Task CreateAsync(CreatePartDto dto);
        Task UpdateAsync(int id, CreatePartDto dto);
        Task DeleteAsync(int id);
    }
}
