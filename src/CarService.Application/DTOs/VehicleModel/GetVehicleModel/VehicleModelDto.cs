using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.VehicleModel.GetVehicleModel
{
    public record VehicleModelDto(int Id, int BrandId, string BrandName, string Name);
}
