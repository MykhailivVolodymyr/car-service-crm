using CarService.Application.DTOs.PartCategory.CreatePartCategory;
using CarService.Application.DTOs.PartCategory.GetPartCategory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services
{
    public interface IPartCategoryService
    {
        Task<IEnumerable<PartCategoryDto>> GetAllAsync();
        Task<PartCategoryDto> GetByIdAsync(int id);
        Task<PartCategoryDto> CreateAsync(CreatePartCategoryDto dto);
        Task UpdateAsync(int id, CreatePartCategoryDto dto);
        Task DeleteAsync(int id);
    }
}
