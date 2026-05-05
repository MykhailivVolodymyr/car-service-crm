using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Schedule.CreateSchedule
{
    public record CreateScheduleDto(
      int? OrderId,
      int PostId,
      int MechanicId,
      DateTime StartTime,
      DateTime EndTime,
      string? Description
  );
}
