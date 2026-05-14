using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Analytics.InventoryPage
{
    public record InventoryStatsDto(
        int TotalPositions,
        decimal TotalInventoryValue,
        int LowStockCount
    );
}
