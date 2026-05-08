using CarService.Application.DTOs.Filter;
using CarService.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Filters.ScheduleFilters
{
    public class ScheduleDateFilter : IScheduleFilterStrategy
    {
        public IQueryable<Schedule> Apply(IQueryable<Schedule> query, ScheduleFilterDto filter)
        {
            if (filter.Date.HasValue)
            {
                var date = filter.Date.Value.Date;
                return query.Where(s => s.StartTime.Date == date);
            }
            return query;
        }
    }
}
