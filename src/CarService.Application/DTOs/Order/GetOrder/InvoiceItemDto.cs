using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Order.GetOrder
{
    public record InvoiceItemDto(
     int Number,
     string Name,
     decimal Price,
     decimal Quantity,
     decimal Total
 );
}
