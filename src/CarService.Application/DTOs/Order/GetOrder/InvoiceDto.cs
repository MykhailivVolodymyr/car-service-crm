using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Order.GetOrder
{
    public record InvoiceDto(
     int OrderId,
     string BrandName,
     string ModelName,
     string Vin,
     string LicensePlate,
     int? Mileage,
     DateTime CreatedAt,
     DateTime? ClosedAt,
     List<InvoiceItemDto> Services,
     List<InvoiceItemDto> Parts,
     decimal TotalAmount
 );
}
