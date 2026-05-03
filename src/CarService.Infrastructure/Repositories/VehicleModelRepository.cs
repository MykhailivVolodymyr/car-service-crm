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
    public class VehicleModelRepository : Repository<VehicleModel>, IVehicleModelRepository
    {
        public VehicleModelRepository(AutoServiceDbContext context) : base(context)
        {
        }

        public override async Task<VehicleModel?> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(m => m.Brand)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public override async Task<IEnumerable<VehicleModel>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(m => m.Brand)
                .ToListAsync();
        }

        public override async Task<IEnumerable<VehicleModel>> GetAsync(Expression<Func<VehicleModel, bool>> predicate)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(m => m.Brand)
                .Where(predicate)
                .ToListAsync();
        }
    }
}
