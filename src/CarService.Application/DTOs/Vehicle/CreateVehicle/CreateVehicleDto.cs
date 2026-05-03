using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Vehicle.CreateVehicle
{
    public record CreateVehicleDto(
        // Клієнт
        int? ClientId,
        string? ClientPhone,
        string? ClientFullName,
        string? ClientEmail,

        // Модель та Бренд
        int? ModelId,
        string? BrandName,
        string? ModelName,

        // Дані авто
        string Vin,
        string LicensePlate,
        int Year
    );
}
