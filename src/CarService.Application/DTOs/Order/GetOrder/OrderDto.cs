using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Order.GetOrder
{
    public record OrderDto(
        int Id,
        int VehicleId,
        string VehicleDetails, // Марка + Модель + Номер
        int ClientId,
        string ClientName,
        string ClientPhone,
        int StatusId,
        string StatusName,
        DateTime CreatedAt,
        DateTime? ClosedAt,
        int? Mileage,
        decimal TotalAmount,
        string? Notes
    );
}
