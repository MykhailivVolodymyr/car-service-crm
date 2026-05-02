using CarService.Domain.Abstractions;
using CarService.Infrastructure.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Infrastructure.Repositories
{
    public class ServiceCategoryRepository: Repository<ServiceCategory>, IServiceCategoryRepository
    {
        public ServiceCategoryRepository(AutoServiceDbContext context) : base(context)
        {
        }
    }
}
