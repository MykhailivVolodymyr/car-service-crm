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
    public class OrderPartRepository : Repository<OrderPart>, IOrderPartRepository
    {
        public OrderPartRepository(AutoServiceDbContext context) : base(context) { }

        public override async Task<IEnumerable<OrderPart>> GetAsync(Expression<Func<OrderPart, bool>> predicate)
        {
            return await _dbSet
                .Include(op => op.Part)
                    .ThenInclude(p => p.Manufacturer)
                .Where(predicate)
                .ToListAsync();
        }
    }
}
