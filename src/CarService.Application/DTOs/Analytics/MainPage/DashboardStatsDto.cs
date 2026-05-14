using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Analytics.MainPaige
{
    public record DashboardStatsDto(
        int AppointmentsToday,
        int AppointmentsThisWeek,
        int AppointmentsThisMonth,
        int TotalClients
    );
}
