using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.WorkPost.GetWorkPost
{
    public record WorkPostDto(int Id, string Name, bool IsActive);
}
