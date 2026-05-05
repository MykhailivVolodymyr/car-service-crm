using CarService.Application.DTOs.Order.CreateOrder;
using CarService.Application.DTOs.Order.GetOrder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services
{
    public interface IOrderService
    {
        Task<IEnumerable<OrderDto>> GetAllAsync();
        Task<OrderDto> GetByIdAsync(int id);
        Task<IEnumerable<OrderDto>> GetByClientIdAsync(int clientId);
        Task<IEnumerable<OrderDto>> GetByVehicleIdAsync(int vehicleId);
        Task<IEnumerable<OrderDto>> SearchActiveOrdersAsync(string searchTerm);
        Task<OrderDto> CreateAsync(CreateOrderDto dto);
        Task UpdateAsync(int id, CreateOrderDto dto);
        Task UpdateStatusAsync(int id, int statusId);
        Task DeleteAsync(int id);
    }
}
