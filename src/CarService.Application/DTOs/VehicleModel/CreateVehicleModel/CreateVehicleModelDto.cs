using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.VehicleModel.CreateVehicleModel
{
    public record CreateVehicleModelDto(
        int? BrandId,
        string? BrandName,
        string ModelName
    );
}
