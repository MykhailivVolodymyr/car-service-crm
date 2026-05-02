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
    public class PartRepository : Repository<Part>, IPartRepository
    {
        public PartRepository(AutoServiceDbContext context) : base(context) { }

        public override async Task<Part?> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(p => p.Category)     
                .Include(p => p.Manufacturer)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public override async Task<IEnumerable<Part>> GetAsync(Expression<Func<Part, bool>> predicate)
        {
            return await _dbSet
                .AsNoTracking()             
                .Include(p => p.Category)
                .Include(p => p.Manufacturer)
                .Where(predicate)
                .ToListAsync();
        }
    }
}
