using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Client.GetClient
{
    public record ClientDto(
        int Id, 
        string FullName, 
        string Phone, 
        string? Email
    );
}
