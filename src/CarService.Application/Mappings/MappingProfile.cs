using AutoMapper;
using CarService.Application.DTOs.Client.CreateClient;
using CarService.Application.DTOs.Client.GetClient;
using CarService.Application.DTOs.Manufacturer.CreateManufacturer;
using CarService.Application.DTOs.Manufacturer.GetManufacturer;
using CarService.Application.DTOs.Part.CreatePart;
using CarService.Application.DTOs.Part.GetPart;
using CarService.Application.DTOs.PartCategory.CreatePartCategory;
using CarService.Application.DTOs.PartCategory.GetPartCategory;
using CarService.Application.DTOs.Service.CreateService;
using CarService.Application.DTOs.Service.GetService;
using CarService.Application.DTOs.Service.UpdateService;
using CarService.Application.DTOs.ServiceCategory.CreateServiceCategory;
using CarService.Application.DTOs.ServiceCategory.GetServiceCategory;
using CarService.Application.DTOs.User.GetUser;
using CarService.Application.DTOs.User.UpdateUser;
using CarService.Application.DTOs.VehicleBrand.CreateVehicleBrand;
using CarService.Application.DTOs.VehicleBrand.GetVehicleBrand;
using CarService.Application.DTOs.VehicleModel.GetVehicleModel;
using CarService.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.Name));

            CreateMap<UserUpdateDto, User>();

            CreateMap<ServiceCategory, CategoryDto>();
            CreateMap<CreateCategoryDto, ServiceCategory>();

            CreateMap<Service, ServiceDto>()
               .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name));

            CreateMap<CreateServiceDto, Service>();
            CreateMap<UpdateServiceDto, Service>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());

            CreateMap<PartCategory, PartCategoryDto>();
            CreateMap<CreatePartCategoryDto, PartCategory>();

            CreateMap<Manufacturer, ManufacturerDto>();
            CreateMap<CreateManufacturerDto, Manufacturer>();

            CreateMap<Part, PartDto>()
                .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category.Name))
                .ForMember(d => d.ManufacturerName, o => o.MapFrom(s => s.Manufacturer.Name));

            CreateMap<CreatePartDto, Part>()
                .ForMember(d => d.Id, o => o.Ignore());

            CreateMap<Client, ClientDto>();
            CreateMap<CreateClientDto, Client>();

            CreateMap<VehicleBrand, VehicleBrandDto>();
            CreateMap<CreateVehicleBrandDto, VehicleBrand>();

            CreateMap<VehicleModel, VehicleModelDto>()
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.Brand.Name));

        }
    }
}
