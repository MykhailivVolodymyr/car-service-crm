using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Analytics
{
    public record ServicePopularityDto(
     string ServiceName,
     int UsageCount,      // Скільки разів надана послуга
     decimal TotalRevenue // Скільки грошей принесла саме ця послуга
 );
}
