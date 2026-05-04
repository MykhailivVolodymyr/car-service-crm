using CarService.Application.Configuration;
using CarService.Application.Services;
using CarService.Application.Services.Imp;
using CarService.Domain.Abstractions;
using CarService.Infrastructure;
using CarService.Infrastructure.Repositories;
using CarService.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

namespace CarService.Api.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IServiceCategoryService, ServiceCategoryService>();
            services.AddScoped<IServiceAppService, ServiceAppService>();
            services.AddScoped<IPartCategoryService, PartCategoryService>();
            services.AddScoped<IManufacturerService, ManufacturerService>();
            services.AddScoped<IPartService, PartService>();
            services.AddScoped<IClientService, ClientService>();
            services.AddScoped<IVehicleBrandService, VehicleBrandService>();
            services.AddScoped<IVehicleModelService, VehicleModelService>();
            services.AddScoped<IVehicleService, VehicleService>();
            services.AddScoped<IWorkPostService, WorkPostService>();

            return services;
        }

        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IServiceCategoryRepository, ServiceCategoryRepository>();
            services.AddScoped<IServiceRepository, ServiceRepository>();
            services.AddScoped<IPartCategoryRepository, PartCategoryRepository>();
            services.AddScoped<IManufacturerRepository, ManufacturerRepository>();
            services.AddScoped<IPartRepository, PartRepository>();
            services.AddScoped<IClientRepository, ClientRepository>();
            services.AddScoped<IVehicleBrandRepository, VehicleBrandRepository>();
            services.AddScoped<IVehicleModelRepository, VehicleModelRepository>();
            services.AddScoped<IVehicleRepository, VehicleRepository>();
            services.AddScoped<IWorkPostRepository, WorkPostRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            return services;
        }

        public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration config)
        {
            var jwtSettings = config.GetSection(JwtOptions.SectionName).Get<JwtOptions>();

            if (jwtSettings == null || string.IsNullOrEmpty(jwtSettings.Key))
            {
                throw new BadHttpRequestException("JWT Settings are not configured properly in appsettings.json");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key));

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,

                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings.Issuer,

                    ValidateAudience = true,
                    ValidAudience = jwtSettings.Audience,

                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                        {
                            context.Response.Headers.Append("Token-Expired", "true");
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            services.AddAuthorization();

            return services;
        }

        public static IServiceCollection AddSwaggerAuthentication(this IServiceCollection services)
        {
            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "CarService API",
                    Version = "v1",
                    Description = "API для системи керування СТО (Service Station CRM)"
                });

                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Введіть ваш JWT токен. Формат: Bearer {your_token}"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            return services;
        }

        public static IServiceCollection AddJwtOptions(this IServiceCollection services, IConfiguration config)
        {
            var jwtOptions = new JwtOptions();

            config.GetSection(JwtOptions.SectionName).Bind(jwtOptions);
            if (string.IsNullOrEmpty(jwtOptions.Key))
            {
                throw new InvalidOperationException("JWT Secret Key is missing. Check your User Secrets!");
            }

            services.Configure<JwtOptions>(options =>
            {
                options.Key = jwtOptions.Key;
                options.Issuer = jwtOptions.Issuer;
                options.Audience = jwtOptions.Audience;
                options.ExpiryHours = jwtOptions.ExpiryHours;
            });

            return services;
        }
    }
}
