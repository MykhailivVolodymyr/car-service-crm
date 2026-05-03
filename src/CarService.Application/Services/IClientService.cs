using CarService.Application.DTOs.Client.CreateClient;
using CarService.Application.DTOs.Client.GetClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services
{
    public interface IClientService
    {
        Task<IEnumerable<ClientDto>> GetAllAsync();
        Task<ClientDto> GetByIdAsync(int id);
        Task<IEnumerable<ClientDto>> SearchAsync(string searchTerm);
        Task<ClientDto> CreateAsync(CreateClientDto dto);
        Task UpdateAsync(int id, CreateClientDto dto);
        Task DeleteAsync(int id);
    }
}
