using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Service.UpdateService
{
    public record UpdateServiceDto(
        int Id,
        string Name,
        string? Description,
        decimal DefaultPrice,
        int CategoryId
    );
}
