using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Analytics.MasterPage
{
    public record MasterPerformanceDto(
        int MasterId,
        string MasterName,
        int OrdersCount,
        decimal TotalRevenue,
        decimal AverageOrderValue,
        double TotalWorkHours
    );
}
