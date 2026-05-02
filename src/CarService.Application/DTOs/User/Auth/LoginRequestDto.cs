using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.User.Auth
{
    public record LoginRequestDto(
        string Login,
        string Password
    );
}
