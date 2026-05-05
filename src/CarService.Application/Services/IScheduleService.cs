using CarService.Application.DTOs.Schedule.CreateSchedule;
using CarService.Application.DTOs.Schedule.GetSchedule;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services
{
    public interface IScheduleService
    {
        Task<ScheduleDto> GetByIdAsync(int id);
        Task<IEnumerable<ScheduleDto>> GetAllAsync();
        Task<ScheduleDto> CreateAsync(CreateScheduleDto dto);
        Task UpdateAsync(int id, CreateScheduleDto dto);
        Task DeleteAsync(int id);

        Task<IEnumerable<ScheduleDto>> GetByPeriodAsync(DateTime start, DateTime end);
        Task<IEnumerable<ScheduleDto>> GetByMechanicAsync(int mechanicId, DateTime? date = null);
        Task<IEnumerable<ScheduleDto>> GetByPostAsync(int postId, DateTime? date = null);
        Task<IEnumerable<AvailableSlotDto>> GetAvailableSlotsAsync(DateTime date, int? postId = null);
        Task LinkOrderAsync(int scheduleId, int orderId);
        Task<bool> IsSlotAvailableAsync(int postId, int mechanicId, DateTime start, DateTime end, int? excludeScheduleId = null);
    }
}
