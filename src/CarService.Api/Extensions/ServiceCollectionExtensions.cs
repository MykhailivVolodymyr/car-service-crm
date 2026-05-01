using CarService.Domain.Abstractions;
using CarService.Infrastructure;
using CarService.Infrastructure.Repositories;
using Microsoft.AspNetCore.Cors.Infrastructure;

namespace CarService.Api.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {

            return services;
        }

        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            return services;
        }
    }
}
