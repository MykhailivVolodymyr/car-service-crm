using CarService.Domain.Abstractions;
using CarService.Infrastructure.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Infrastructure.Repositories
{
    public class RoleRepository: Repository<Role>, IRoleRepository
    {
        public RoleRepository(AutoServiceDbContext context) : base(context)
        {
        }
    }
}
