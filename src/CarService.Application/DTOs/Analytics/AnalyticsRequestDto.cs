using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Analytics
{
    public record AnalyticsRequestDto(
        DateTime? StartDate,
        DateTime? EndDate,
        string? PeriodType // "week", "month", "quarter", "custom"
    );
}
