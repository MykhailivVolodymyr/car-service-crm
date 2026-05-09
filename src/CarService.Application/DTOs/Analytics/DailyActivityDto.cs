using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Analytics
{
    public record DailyActivityDto(
      string DayName,      // Назва дня (Понеділок, Вівторок...)
      int Appointments,    // Кількість записів у розкладі
      decimal Revenue      // Дохід за цей день
  );
}
