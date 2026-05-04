using CarService.Application.DTOs.OrderPart.CreateOrderPart;
using CarService.Application.DTOs.OrderPart.GetOrderPart;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services
{
    public interface IOrderPartService
    {
        Task<IEnumerable<OrderPartDto>> GetPartsByOrderIdAsync(int orderId);
        Task<OrderPartDto> AddPartToOrderAsync(AddOrderPartDto dto);
        Task RemovePartFromOrderAsync(int orderPartId, decimal quantityToRemove = 1);
        Task DeletePartLineAsync(int orderPartId);
    }
}
