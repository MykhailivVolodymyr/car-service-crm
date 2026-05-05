using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Schedule.GetSchedule
{
    public record ScheduleDto(
     int Id,
     int? OrderId,
     string? VehicleDisplay,
     int? ClientId,         
     string? ClientName,
     string? ClientPhone,    
     int PostId,
     string PostName,
     int MechanicId,
     string MechanicName,
     DateTime StartTime,
     DateTime EndTime,
     string? Description
 );
}
