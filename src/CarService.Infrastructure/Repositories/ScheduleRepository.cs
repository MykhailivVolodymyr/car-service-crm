using CarService.Domain.Abstractions;
using CarService.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Infrastructure.Repositories
{
    public class ScheduleRepository : Repository<Schedule>, IScheduleRepository
    {
        public ScheduleRepository(AutoServiceDbContext context) : base(context) { }

        public override async Task<Schedule?> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(s => s.Mechanic)
                .Include(s => s.Post)
                .Include(s => s.Order)
                    .ThenInclude(o => o.Vehicle)
                        .ThenInclude(v => v.Model)
                            .ThenInclude(m => m.Brand)
                .Include(s => s.Order)
                    .ThenInclude(o => o.Vehicle)
                        .ThenInclude(v => v.Client)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public override async Task<IEnumerable<Schedule>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(s => s.Mechanic)
                .Include(s => s.Post)
                .Include(s => s.Order)
                    .ThenInclude(o => o.Vehicle)
                        .ThenInclude(v => v.Model)
                            .ThenInclude(m => m.Brand)
                .Include(s => s.Order)
                    .ThenInclude(o => o.Vehicle)
                        .ThenInclude(v => v.Client)
                .ToListAsync();
        }

        public override async Task<IEnumerable<Schedule>> GetAsync(Expression<Func<Schedule, bool>> predicate)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(s => s.Mechanic)
                .Include(s => s.Post)
                .Include(s => s.Order)
                    .ThenInclude(o => o.Vehicle)
                        .ThenInclude(v => v.Model)
                            .ThenInclude(m => m.Brand)
                .Include(s => s.Order)
                    .ThenInclude(o => o.Vehicle)
                        .ThenInclude(v => v.Client)
                .Where(predicate)
                .ToListAsync();
        }
    }
}
