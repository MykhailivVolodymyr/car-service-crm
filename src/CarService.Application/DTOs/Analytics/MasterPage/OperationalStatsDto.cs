using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Analytics.MasterPage
{
    public record OperationalStatsDto(
         int TotalMasters,
         int TotalServices,
         int ActiveMasters
     );
}
