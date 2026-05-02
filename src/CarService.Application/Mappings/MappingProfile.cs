using AutoMapper;
using CarService.Application.DTOs.Service.CreateService;
using CarService.Application.DTOs.Service.GetService;
using CarService.Application.DTOs.Service.UpdateService;
using CarService.Application.DTOs.ServiceCategory.CreateServiceCategory;
using CarService.Application.DTOs.ServiceCategory.GetServiceCategory;
using CarService.Application.DTOs.User.GetUser;
using CarService.Application.DTOs.User.UpdateUser;
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
        }
    }
}
