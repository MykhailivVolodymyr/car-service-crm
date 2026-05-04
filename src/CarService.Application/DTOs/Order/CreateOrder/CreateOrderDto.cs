using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Order.CreateOrder
{
    public record CreateOrderDto(
        // Існуючі зв'язки
        int? VehicleId,
        int StatusId,

        // Дані для створення авто (якщо VehicleId == null)
        int? ModelId,
        string? BrandName,
        string? ModelName,
        string? Vin,
        string? LicensePlate,
        int? Year,

        // Дані для клієнта (якщо створюємо авто з нуля або шукаємо існуючого)
        int? ClientId,
        string? ClientPhone,
        string? ClientFullName,
        string? ClientEmail,

        // Дані замовлення
        int? Mileage,
        string? Notes
    );
}
