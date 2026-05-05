using AutoMapper;
using CarService.Application.DTOs.Schedule.CreateSchedule;
using CarService.Application.DTOs.Schedule.GetSchedule;
using CarService.Application.Exceptions;
using CarService.Domain.Abstractions;
using CarService.Infrastructure;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services.Imp
{
    public class ScheduleService : IScheduleService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<ScheduleService> _logger;

        public ScheduleService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<ScheduleService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<ScheduleDto> GetByIdAsync(int id)
        {
            _logger.LogInformation("Fetching schedule record #{Id}", id);
            var schedule = await _unitOfWork.Schedules.GetByIdAsync(id);

            if (schedule == null)
                throw new NotFoundException($"Запис у розкладі #{id} не знайдено.");

            return _mapper.Map<ScheduleDto>(schedule);
        }

        public async Task<ScheduleDto> CreateAsync(CreateScheduleDto dto)
        {
            _logger.LogInformation("Attempting to create schedule for Post {PostId} and Mechanic {MechanicId}", dto.PostId, dto.MechanicId);

            // 1. Перевірка чи механік існує і чи має роль Майстра (RoleId = 2)
            var user = await _unitOfWork.Users.GetByIdAsync(dto.MechanicId);
            if (user == null || user.RoleId != 2)
                throw new BadRequestException("Призначений користувач не є майстром або не знайдений.");

            // 2. Перевірка конфліктів (час/пост/механік)
            if (!await IsSlotAvailableAsync(dto.PostId, dto.MechanicId, dto.StartTime, dto.EndTime))
                throw new BadRequestException("Обраний час, пост або механік уже зайняті іншим записом.");

            var schedule = _mapper.Map<Schedule>(dto);

            await _unitOfWork.Schedules.AddAsync(schedule);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Schedule #{Id} created successfully.", schedule.Id);

            return await GetByIdAsync(schedule.Id);
        }

        public async Task UpdateAsync(int id, CreateScheduleDto dto)
        {
            _logger.LogInformation("Updating schedule record #{Id}", id);

            var schedule = await _unitOfWork.Schedules.GetByIdAsync(id);
            if (schedule == null) throw new NotFoundException("Запис не знайдено.");

            // Перевірка конфліктів, виключаючи поточний запис
            if (!await IsSlotAvailableAsync(dto.PostId, dto.MechanicId, dto.StartTime, dto.EndTime, id))
                throw new BadRequestException("Неможливо оновити: обраний час або ресурси зайняті.");

            _mapper.Map(dto, schedule);
            _unitOfWork.Schedules.Update(schedule);
            await _unitOfWork.CompleteAsync();
        }

        public async Task DeleteAsync(int id)
        {
            _logger.LogWarning("Deleting schedule record #{Id}", id);
            var schedule = await _unitOfWork.Schedules.GetByIdAsync(id);

            if (schedule != null)
            {
                _unitOfWork.Schedules.Delete(schedule);
                await _unitOfWork.CompleteAsync();
            }
        }

        public async Task<IEnumerable<ScheduleDto>> GetByPeriodAsync(DateTime start, DateTime end)
        {
            _logger.LogInformation("Fetching schedule from {Start} to {End}", start, end);
            var items = await _unitOfWork.Schedules.GetAsync(s => s.StartTime < end && s.EndTime > start);
            return _mapper.Map<IEnumerable<ScheduleDto>>(items);
        }

        public async Task<IEnumerable<ScheduleDto>> GetByMechanicAsync(int mechanicId, DateTime? date = null)
        {
            var items = await _unitOfWork.Schedules.GetAsync(s =>
                s.MechanicId == mechanicId &&
                (!date.HasValue || s.StartTime.Date == date.Value.Date));

            return _mapper.Map<IEnumerable<ScheduleDto>>(items);
        }

        public async Task<IEnumerable<ScheduleDto>> GetByPostAsync(int postId, DateTime? date = null)
        {
            var items = await _unitOfWork.Schedules.GetAsync(s =>
                s.PostId == postId &&
                (!date.HasValue || s.StartTime.Date == date.Value.Date));

            return _mapper.Map<IEnumerable<ScheduleDto>>(items);
        }

        public async Task<IEnumerable<ScheduleDto>> GetAllAsync()
        {
            _logger.LogInformation("Fetching all schedule records.");
            var items = await _unitOfWork.Schedules.GetAllAsync();
            return _mapper.Map<IEnumerable<ScheduleDto>>(items);
        }

        public async Task LinkOrderAsync(int scheduleId, int orderId)
        {
            _logger.LogInformation("Linking Order #{OrderId} to Schedule #{ScheduleId}", orderId, scheduleId);

            var schedule = await _unitOfWork.Schedules.GetByIdAsync(scheduleId);
            if (schedule == null) throw new NotFoundException("Запис розкладу не знайдено.");

            var orderExists = await _unitOfWork.Orders.AnyAsync(o => o.Id == orderId);
            if (!orderExists) throw new NotFoundException("Замовлення не знайдено.");

            schedule.OrderId = orderId;
            _unitOfWork.Schedules.Update(schedule);
            await _unitOfWork.CompleteAsync();
        }

        public async Task<bool> IsSlotAvailableAsync(int postId, int mechanicId, DateTime start, DateTime end, int? excludeId = null)
        {
            // Базова математика перетинів: (Start1 < End2) AND (End1 > Start2)
            // Перевіряємо конфлікт або по посту, або по механіку
            var hasConflict = await _unitOfWork.Schedules.AnyAsync(s =>
                s.Id != excludeId &&
                (s.PostId == postId || s.MechanicId == mechanicId) &&
                s.StartTime < end && s.EndTime > start);

            return !hasConflict;
        }

        public async Task<IEnumerable<AvailableSlotDto>> GetAvailableSlotsAsync(DateTime date, int? postId = null)
        {
            _logger.LogInformation("Calculating available slots with mechanic assignment for {Date}", date.ToShortDateString());

            var workStart = date.Date.AddHours(9);
            var workEnd = date.Date.AddHours(18);
            var slotDurationMinutes = 60;

            // Отримуємо всіх активних майстрів
            var allMechanics = await _unitOfWork.Users.GetAsync(u => u.RoleId == 2 && (u.IsActive ?? true));

            // Отримуємо існуючий розклад на день
            var daySchedules = await _unitOfWork.Schedules.GetAsync(s => s.StartTime.Date == date.Date);

            var availableSlots = new List<AvailableSlotDto>();
            var currentStart = workStart;

            while (currentStart.AddMinutes(slotDurationMinutes) <= workEnd)
            {
                var currentEnd = currentStart.AddMinutes(slotDurationMinutes);

                // 1. Перевірка посту (якщо вказано)
                bool isPostBusy = postId.HasValue && daySchedules.Any(s =>
                    s.PostId == postId.Value && currentStart < s.EndTime && currentEnd > s.StartTime);

                if (!isPostBusy)
                {
                    // 2. Шукаємо ПЕРШОГО вільного механіка для цього слоту
                    var freeMechanic = allMechanics
                        .FirstOrDefault(m => !daySchedules.Any(s =>
                            s.MechanicId == m.Id && currentStart < s.EndTime && currentEnd > s.StartTime));

                    if (freeMechanic != null)
                    {
                        availableSlots.Add(new AvailableSlotDto(
                            currentStart,
                            currentEnd,
                            postId ?? 0,
                            freeMechanic.Id,
                            freeMechanic.FullName
                        ));
                    }
                }

                currentStart = currentStart.AddMinutes(slotDurationMinutes);
            }

            return availableSlots;
        }
    }
}
