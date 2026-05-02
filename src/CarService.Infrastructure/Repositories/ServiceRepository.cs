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
    public class ServiceRepository: Repository<Service>, IServiceRepository
    {
        public ServiceRepository(AutoServiceDbContext context) : base(context)
        {
        }

        public override async Task<Service?> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(s => s.Category)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public override async Task<IEnumerable<Service>> GetAsync(Expression<Func<Service, bool>> predicate)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(s => s.Category)
                .Where(predicate)
                .ToListAsync();
        }
    }
}
