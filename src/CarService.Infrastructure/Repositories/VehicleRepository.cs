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
    public class VehicleRepository : Repository<Vehicle>, IVehicleRepository
    {
        public VehicleRepository(AutoServiceDbContext context) : base(context) { }

        public override async Task<Vehicle?> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(v => v.Client)
                .Include(v => v.Model)
                    .ThenInclude(m => m.Brand)
                .FirstOrDefaultAsync(v => v.Id == id);
        }

        public override async Task<IEnumerable<Vehicle>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(v => v.Client)
                .Include(v => v.Model)
                    .ThenInclude(m => m.Brand)
                .ToListAsync();
        }

        public override async Task<IEnumerable<Vehicle>> GetAsync(Expression<Func<Vehicle, bool>> predicate)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(v => v.Client)
                .Include(v => v.Model)
                    .ThenInclude(m => m.Brand)
                .Where(predicate)
                .ToListAsync();
        }
    }
}
