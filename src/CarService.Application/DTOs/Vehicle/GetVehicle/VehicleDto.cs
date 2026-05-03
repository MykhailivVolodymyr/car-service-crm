using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Vehicle.GetVehicle
{
    public record VehicleDto(
        int Id,
        int? ClientId,
        string? ClientFullName,
        string? ClientPhone,
        int ModelId,
        string BrandName,
        string ModelName,
        string Vin,
        string LicensePlate,
        int Year
    );
}
