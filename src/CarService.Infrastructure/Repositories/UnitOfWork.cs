using CarService.Domain.Abstractions;
using CarService.Infrastructure.Context;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Azure.Core.HttpHeader;

namespace CarService.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AutoServiceDbContext _context;
        private readonly IServiceProvider _serviceProvider;
        private bool _disposed = false;

        private IUserRepository? _users;
        private IRoleRepository? _roles;
        private IServiceCategoryRepository? _serviceCategories;
        private IServiceRepository? _services;
        private IPartCategoryRepository? _partCategories;
        private IManufacturerRepository? _manufacturers;
        private IPartRepository? _parts;
        private IClientRepository? _clients;
        private IVehicleBrandRepository? _vehicleBrands;
        private IVehicleModelRepository? _vehicleModels;
        private IVehicleRepository? _vehicles;
        private IWorkPostRepository? _workPosts;

        public UnitOfWork(AutoServiceDbContext context, IServiceProvider serviceProvider)
        {
            _context = context;
            _serviceProvider = serviceProvider;
        }

        public IUserRepository Users => _users ??= _serviceProvider.GetRequiredService<IUserRepository>();
        public IRoleRepository Roles => _roles ??= _serviceProvider.GetRequiredService<IRoleRepository>();
        public IServiceCategoryRepository ServiceCategories => _serviceCategories ??= _serviceProvider.GetRequiredService<IServiceCategoryRepository>();
        public IServiceRepository Services => _services ??= _serviceProvider.GetRequiredService<IServiceRepository>();
        public IPartCategoryRepository PartCategories => _partCategories ??= _serviceProvider.GetRequiredService<IPartCategoryRepository>();
        public IManufacturerRepository Manufacturers => _manufacturers ??= _serviceProvider.GetRequiredService<IManufacturerRepository>();
        public IPartRepository Parts => _parts ??= _serviceProvider.GetRequiredService<IPartRepository>();
        public IClientRepository Clients => _clients ??= _serviceProvider.GetRequiredService<IClientRepository>();
        public IVehicleBrandRepository VehicleBrands => _vehicleBrands ??= _serviceProvider.GetRequiredService<IVehicleBrandRepository>();
        public IVehicleModelRepository VehicleModels => _vehicleModels ??= _serviceProvider.GetRequiredService<IVehicleModelRepository>();
        public IVehicleRepository Vehicles => _vehicles ??= _serviceProvider.GetRequiredService<IVehicleRepository>();
        public IWorkPostRepository WorkPosts => _workPosts ??= _serviceProvider.GetRequiredService<IWorkPostRepository>();


        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _context.Dispose();
                }
                _disposed = true;
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
