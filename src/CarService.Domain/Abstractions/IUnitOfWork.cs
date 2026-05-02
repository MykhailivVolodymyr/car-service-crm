using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Domain.Abstractions
{
    public interface IUnitOfWork : IDisposable
    {
        IUserRepository Users { get; }
        IRoleRepository Roles { get; }
        IServiceCategoryRepository ServiceCategories { get; }
        IServiceRepository Services { get; }
        IPartCategoryRepository PartCategories { get; }
        IManufacturerRepository Manufacturers { get; }
        IPartRepository Parts { get; }
        Task<int> CompleteAsync();
    }
}
