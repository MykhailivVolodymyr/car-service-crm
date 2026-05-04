using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.WorkPost.CreateWorkPost
{
    public record CreateWorkPostDto(string Name, bool IsActive = true);
}
