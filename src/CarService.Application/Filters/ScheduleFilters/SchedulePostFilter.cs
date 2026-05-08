using CarService.Application.DTOs.Filter;
using CarService.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Filters.ScheduleFilters
{
    public class SchedulePostFilter : IScheduleFilterStrategy
    {
        public IQueryable<Schedule> Apply(IQueryable<Schedule> query, ScheduleFilterDto filter)
        {
            if (filter.PostId.HasValue)
            {
                return query.Where(s => s.PostId == filter.PostId.Value);
            }
            return query;
        }
    }
}
