using CarService.Application.DTOs.Filter;
using CarService.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Filters.ScheduleFilters
{
    public class ScheduleMechanicFilter : IScheduleFilterStrategy
    {
        public IQueryable<Schedule> Apply(IQueryable<Schedule> query, ScheduleFilterDto filter)
        {
            if (filter.MechanicId.HasValue)
            {
                return query.Where(s => s.MechanicId == filter.MechanicId.Value);
            }
            return query;
        }
    }
}
