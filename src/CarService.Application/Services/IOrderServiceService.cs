using CarService.Application.DTOs.OrderService.CreateOrderService;
using CarService.Application.DTOs.OrderService.GetOrderService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services
{
    public interface IOrderServiceService
    {
        Task<IEnumerable<OrderServiceDto>> GetServicesByOrderIdAsync(int orderId);
        Task<OrderServiceDto> AddServiceToOrderAsync(AddOrderServiceDto dto);
        Task UpdateQuantityAsync(int orderServiceId, decimal newQuantity);
        Task RemoveServiceFromOrderAsync(int orderServiceId, decimal quantityToRemove = 1);
        Task DeleteServiceLineAsync(int orderServiceId);
    }
}
