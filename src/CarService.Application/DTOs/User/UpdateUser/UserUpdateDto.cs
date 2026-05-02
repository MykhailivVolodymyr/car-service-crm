using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.User.UpdateUser
{
    public record UserUpdateDto(
        int Id,
        string FullName,
        string? Phone,
        int RoleId,
        bool IsActive
    );
}
