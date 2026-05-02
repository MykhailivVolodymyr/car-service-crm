using CarService.Application.DTOs.ServiceCategory.CreateServiceCategory;
using CarService.Application.DTOs.ServiceCategory.GetServiceCategory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services
{
    public interface IServiceCategoryService
    {
        Task<IEnumerable<CategoryDto>> GetAllAsync();
        Task<CategoryDto> GetByIdAsync(int id);
        Task<CategoryDto> CreateAsync(CreateCategoryDto dto);
        Task UpdateAsync(int id, CreateCategoryDto dto);
        Task DeleteAsync(int id);
    }
}
