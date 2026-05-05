using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Schedule.GetSchedule
{
    public record AvailableSlotDto(
         DateTime Start,
         DateTime End,
         int PostId,
         int MechanicId,      
         string MechanicName 
     );
}
