using CarService.Application.DTOs.Service.CreateService;
using CarService.Application.DTOs.Service.GetService;
using CarService.Application.DTOs.Service.UpdateService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services
{
    public interface IServiceAppService
    {
        Task<IEnumerable<ServiceDto>> GetAllAsync();
        Task<ServiceDto> GetByIdAsync(int id);
        Task<IEnumerable<ServiceDto>> GetByCategoryAsync(int categoryId);
        Task<IEnumerable<ServiceDto>> SearchAsync(string searchTerm);
        Task CreateAsync(CreateServiceDto dto);
        Task UpdateAsync(UpdateServiceDto dto);
        Task DeleteAsync(int id);
    }
}
