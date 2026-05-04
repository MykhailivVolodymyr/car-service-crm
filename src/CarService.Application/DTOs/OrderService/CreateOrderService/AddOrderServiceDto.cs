using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.OrderService.CreateOrderService
{
    public record AddOrderServiceDto(
        int OrderId,
        int? ServiceId,
        string? CustomName,
        decimal? Price,
        decimal Quantity = 1
    );
}
