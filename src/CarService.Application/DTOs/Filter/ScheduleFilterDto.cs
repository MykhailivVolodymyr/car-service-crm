using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Filter
{
    public record ScheduleFilterDto(
        DateTime? Date,
        int? PostId,      
        int? MechanicId,
        string? SearchTerm
    );
}
