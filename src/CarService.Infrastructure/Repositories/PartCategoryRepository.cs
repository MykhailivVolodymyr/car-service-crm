using CarService.Domain.Abstractions;
using CarService.Infrastructure.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Infrastructure.Repositories
{
    public class PartCategoryRepository: Repository<PartCategory>, IPartCategoryRepository
    {
        public PartCategoryRepository(AutoServiceDbContext context) : base(context)
        {
        }
    }
}
