using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.User.GetUser
{
    public record UserDto(
        int Id,
        string FullName,
        string Email,
        string? Phone,
        string RoleName,
        bool IsActive
    );
}
