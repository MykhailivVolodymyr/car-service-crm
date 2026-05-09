using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Analytics
{
    public record VehiclePopularityDto(
      string Brand,
      string Model,
      int VisitCount
  );
}
