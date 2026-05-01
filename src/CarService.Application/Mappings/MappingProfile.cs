using AutoMapper;
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
            // Приклад: мапінг з сутності бази в DTO і навпаки
            // CreateMap<Vehicle, VehicleDto>().ReverseMap();
            // CreateMap<Order, OrderDto>();
        }
    }
}
