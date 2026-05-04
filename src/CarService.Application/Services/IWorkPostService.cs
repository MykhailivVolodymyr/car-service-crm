using CarService.Application.DTOs.WorkPost.CreateWorkPost;
using CarService.Application.DTOs.WorkPost.GetWorkPost;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services
{
    public interface IWorkPostService
    {
        Task<IEnumerable<WorkPostDto>> GetAllAsync(bool onlyActive = false);
        Task<WorkPostDto> GetByIdAsync(int id);
        Task<WorkPostDto> CreateAsync(CreateWorkPostDto dto);
        Task UpdateAsync(int id, CreateWorkPostDto dto);
        Task ToggleStatusAsync(int id);
        Task DeleteAsync(int id);
    }
}
