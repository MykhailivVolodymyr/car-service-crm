using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Analytics
{
    public record HourlyLoadDto(
    string Hour,        // Формат "08:00", "09:00" тощо
    int AppointmentsCount
);
}
