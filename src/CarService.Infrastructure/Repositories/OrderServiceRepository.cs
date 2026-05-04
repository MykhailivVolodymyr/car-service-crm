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
    public class OrderServiceRepository : Repository<OrderService>, IOrderServiceRepository
    {
        public OrderServiceRepository(AutoServiceDbContext context) : base(context) { }

        public override async Task<IEnumerable<OrderService>> GetAsync(Expression<Func<OrderService, bool>> predicate)
        {
            return await _dbSet
                .Include(os => os.Service)
                    .ThenInclude(s => s.Category)
                .Where(predicate)
                .ToListAsync();
        }
    }
}
