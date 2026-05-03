using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Client.CreateClient
{
    public record CreateClientDto(
        string FullName, 
        string Phone, 
        string? Email
    );
}
