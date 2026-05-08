using CarService.Application.DTOs.Filter;
using CarService.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Filters.ScheduleFilters
{
    public interface IScheduleFilterStrategy
    {
        IQueryable<Schedule> Apply(IQueryable<Schedule> query, ScheduleFilterDto filter);
    }
}
