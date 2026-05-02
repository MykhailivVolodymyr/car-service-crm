using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.User.CreateUser
{
    public record MasterCreatedResponseDto(
        string Email,
        string Password
    );
}
