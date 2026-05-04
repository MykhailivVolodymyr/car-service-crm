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
    public class OrderRepository : Repository<Order>, IOrderRepository
    {
        public OrderRepository(AutoServiceDbContext context) : base(context) { }

        public override async Task<IEnumerable<Order>> GetAllAsync()
        {
            return await ApplyIncludes(_dbSet).ToListAsync();
        }

        public override async Task<Order?> GetByIdAsync(int id)
        {
            return await ApplyIncludes(_dbSet).FirstOrDefaultAsync(o => o.Id == id);
        }

        public override async Task<IEnumerable<Order>> GetAsync(Expression<Func<Order, bool>> predicate)
        {
            return await ApplyIncludes(_dbSet)
                .Where(predicate)
                .ToListAsync();
        }

        private IQueryable<Order> ApplyIncludes(IQueryable<Order> query)
        {
            return query
                .Include(o => o.Status)
                .Include(o => o.Vehicle)
                    .ThenInclude(v => v.Client)
                .Include(o => o.Vehicle)
                    .ThenInclude(v => v.Model)
                        .ThenInclude(m => m.Brand);
        }
    }
}
