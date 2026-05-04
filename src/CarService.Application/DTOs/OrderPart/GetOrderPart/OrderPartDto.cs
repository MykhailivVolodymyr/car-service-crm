using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.OrderPart.GetOrderPart
{
    public record OrderPartDto(
        int Id,
        int OrderId,
        int? PartId,
        string PartName,
        decimal Price,
        decimal Quantity,
        decimal TotalPrice
    );
}
