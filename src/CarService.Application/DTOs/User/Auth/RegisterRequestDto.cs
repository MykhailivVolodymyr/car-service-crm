using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.User.Auth
{
    public record RegisterRequestDto(
        string FullName,
        string Login,
        string Password,
        string? Phone
    );
}
