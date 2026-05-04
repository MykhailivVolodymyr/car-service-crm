using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.OrderService.GetOrderService
{
    public record OrderServiceDto(
        int Id,
        int OrderId,
        int? ServiceId,
        string ServiceName,
        decimal Price,
        decimal Quantity,
        decimal TotalPrice
    );
}
