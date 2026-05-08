using CarService.Application.DTOs.Filter;
using CarService.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Filters.ScheduleFilters
{
    public class ScheduleSearchFilter : IScheduleFilterStrategy
    {
        public IQueryable<Schedule> Apply(IQueryable<Schedule> query, ScheduleFilterDto filter)
        {
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var term = filter.SearchTerm.ToLower();
                return query.Where(s =>
                    s.Order != null && (
                        s.Order.Vehicle.LicensePlate.ToLower().Contains(term) ||
                        s.Order.Vehicle.Client.FullName.ToLower().Contains(term)
                    ));
            }
            return query;
        }
    }
}
