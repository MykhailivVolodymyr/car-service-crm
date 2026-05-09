using CarService.Application.DTOs.Analytics;
using CarService.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services.Imp
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AnalyticsService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<GeneralAnalyticsDto> GetGeneralAnalyticsAsync(AnalyticsRequestDto request)
        {
            var (startDate, endDate) = DefinePeriod(request);

            // 1. Формуємо Queryable (це ще не запит в БД)
            var schedulesQuery = _unitOfWork.Schedules.GetQueryable()
                .Where(s => s.StartTime >= startDate && s.StartTime <= endDate);

            var closedOrdersQuery = _unitOfWork.Orders.GetQueryable()
                .Where(o => (o.StatusId == 4 || o.StatusId == 5) && o.ClosedAt >= startDate && o.ClosedAt <= endDate);

            // 2. Використовуємо МЕТОДИ РЕПОЗИТОРІЮ (замість EF)
            int totalAppointments = await _unitOfWork.Schedules.CountAsync(schedulesQuery);

            var closedOrders = (await _unitOfWork.Orders.ToListAsync(closedOrdersQuery)).ToList();
            int completedOrdersCount = closedOrders.Count;

            decimal totalRevenue = closedOrders.Sum(o => o.TotalAmount ?? 0);
            decimal averageCheck = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;

            double totalDays = (endDate - startDate).TotalDays;
            if (totalDays < 1) totalDays = 1;
            double avgApptsPerDay = totalAppointments / totalDays;

            var scheduledEntries = await _unitOfWork.Schedules.ToListAsync(schedulesQuery);
            var scheduledOrderIds = scheduledEntries
                .Where(s => s.OrderId != null)
                .Select(s => s.OrderId!.Value)
                .Distinct()
                .ToList();

            int scheduledUniqueCount = scheduledOrderIds.Count;
            int convertedCount = closedOrders.Count(o => scheduledOrderIds.Contains(o.Id));

            double conversionRate = scheduledUniqueCount > 0
                ? (double)convertedCount / scheduledUniqueCount * 100
                : 0;

            return new GeneralAnalyticsDto(
                totalAppointments,
                completedOrdersCount,
                totalRevenue,
                averageCheck,
                Math.Round(avgApptsPerDay, 2),
                Math.Round(conversionRate, 2)
            );
        }

        public async Task<IEnumerable<VehiclePopularityDto>> GetTopVehiclesAsync(AnalyticsRequestDto request)
        {
            var (startDate, endDate) = DefinePeriod(request);

            // 1. Формуємо запит (через IQueryable<Schedule>)
            var query = _unitOfWork.Schedules.GetQueryable()
                .Where(s => s.StartTime >= startDate && s.StartTime <= endDate && s.OrderId != null);

            // 2. Викликаємо ТВІЙ метод репозиторію. 
            // Він поверне список об'єктів Schedule, де вже завантажені всі зв'язки (Brand, Model)
            var schedules = await _unitOfWork.Schedules.ToListAsync(query);

            // 3. Робимо групування вже в пам'яті сервера (LINQ to Objects)
            return schedules
                .GroupBy(s => new
                {
                    BrandName = s.Order?.Vehicle?.Model?.Brand?.Name ?? "Unknown",
                    ModelName = s.Order?.Vehicle?.Model?.Name ?? "Unknown"
                })
                .Select(g => new VehiclePopularityDto(
                    g.Key.BrandName,
                    g.Key.ModelName,
                    g.Count()
                ))
                .OrderByDescending(x => x.VisitCount)
                .Take(10);
        }

        public async Task<IEnumerable<ClientPopularityDto>> GetTopClientsAsync(AnalyticsRequestDto request)
        {
            var (startDate, endDate) = DefinePeriod(request);

            var query = _unitOfWork.Schedules.GetQueryable()
                .Where(s => s.StartTime >= startDate && s.StartTime <= endDate && s.Order != null);

            var schedules = await _unitOfWork.Schedules.ToListAsync(query);

            var result = schedules
                .GroupBy(s => new
                {
                    Name = s.Order?.Vehicle?.Client?.FullName ?? "Гість",
                    Phone = s.Order?.Vehicle?.Client?.Phone ?? "-"
                })
                .Select(g => new ClientPopularityDto(
                    g.Key.Name,
                    g.Key.Phone,
                    g.Count() // Кількість записів у розкладі для цього клієнта
                ))
                .OrderByDescending(x => x.VisitCount)
                .Take(10);

            return result;
        }

        public async Task<IEnumerable<ServicePopularityDto>> GetTopServicesAsync(AnalyticsRequestDto request)
        {
            var (startDate, endDate) = DefinePeriod(request);

            var query = _unitOfWork.Orders.GetQueryable()
                .Where(o => o.CreatedAt >= startDate && o.CreatedAt <= endDate);

            var orders = await _unitOfWork.Orders.ToListAsync(query);

            var allServices = orders.SelectMany(o => o.OrderServices);

            var result = allServices
                .GroupBy(os => os.Service?.Name ?? os.CustomName)
                .Select(g => new ServicePopularityDto(
                    g.Key,
                    g.Count(),
                    g.Sum(os => (os.Price * (os.Quantity ?? 1)))
                ))
                .OrderByDescending(x => x.UsageCount)
                .Take(10)
                .ToList();

            return result;
        }

        public async Task<IEnumerable<DailyActivityDto>> GetDailyActivityAsync(AnalyticsRequestDto request)
        {
            var (startDate, endDate) = DefinePeriod(request);

            // 1. Отримуємо записи розкладу за період
            var schedulesQuery = _unitOfWork.Schedules.GetQueryable()
                .Where(s => s.StartTime >= startDate && s.StartTime <= endDate);
            var schedules = await _unitOfWork.Schedules.ToListAsync(schedulesQuery);

            // 2. Отримуємо закриті замовлення за той самий період (для доходу)
            var ordersQuery = _unitOfWork.Orders.GetQueryable()
                .Where(o => (o.StatusId == 4 || o.StatusId == 5) && o.ClosedAt >= startDate && o.ClosedAt <= endDate);
            var orders = await _unitOfWork.Orders.ToListAsync(ordersQuery);

            // Список днів тижня для правильного порядку на графіку
            var daysOfWeek = Enum.GetValues(typeof(DayOfWeek)).Cast<DayOfWeek>().ToList();

            // Переставляємо, щоб тиждень починався з Понеділка (опціонально)
            // Monday, Tuesday... Sunday
            var sortedDays = daysOfWeek.OrderBy(d => (int)d == 0 ? 7 : (int)d);

            var result = sortedDays.Select(day =>
            {
                // Рахуємо записи для цього дня тижня
                int appointmentsCount = schedules.Count(s => s.StartTime.DayOfWeek == day);

                // Рахуємо дохід для цього дня тижня (по даті закриття замовлення)
                decimal dailyRevenue = orders
                    .Where(o => o.ClosedAt.HasValue && o.ClosedAt.Value.DayOfWeek == day)
                    .Sum(o => o.TotalAmount ?? 0);

                return new DailyActivityDto(
                    TranslateDay(day),
                    appointmentsCount,
                    dailyRevenue
                );
            });

            return result;
        }

        public async Task<IEnumerable<HourlyLoadDto>> GetHourlyLoadAsync(AnalyticsRequestDto request)
        {
            var (startDate, endDate) = DefinePeriod(request);
            // 1. Отримуємо всі записи розкладу за обраний період
            var query = _unitOfWork.Schedules.GetQueryable()
                .Where(s => s.StartTime >= startDate && s.StartTime <= endDate);

            var schedules = await _unitOfWork.Schedules.ToListAsync(query);

            var workingHours = Enumerable.Range(8, 13); // 8, 9, 10... 20

            var result = workingHours.Select(hour =>
            {
                int count = schedules.Count(s => s.StartTime.Hour == hour);

                return new HourlyLoadDto(
                    $"{hour:D2}:00", 
                    count
                );
            });

            return result;
        }

        private string TranslateDay(DayOfWeek day)
        {
            return day switch
            {
                DayOfWeek.Monday => "Понеділок",
                DayOfWeek.Tuesday => "Вівторок",
                DayOfWeek.Wednesday => "Середа",
                DayOfWeek.Thursday => "Четвер",
                DayOfWeek.Friday => "П'ятниця",
                DayOfWeek.Saturday => "Субота",
                DayOfWeek.Sunday => "Неділя",
                _ => day.ToString()
            };
        }

        private (DateTime Start, DateTime End) DefinePeriod(AnalyticsRequestDto request)
        {
            var now = DateTime.Now;

            // Якщо тип періоду не заданий, використовуємо "month" за замовчуванням
            string periodType = request.PeriodType?.ToLower() ?? "month";

            return periodType switch
            {
                "week" => (now.AddDays(-7).Date, now),
                "month" => (now.AddMonths(-1).Date, now),
                "quarter" => (now.AddMonths(-3).Date, now),
                "custom" => (request.StartDate?.Date ?? now.AddMonths(-1).Date,
                             request.EndDate ?? now),
                _ => (now.AddMonths(-1).Date, now)
            };
        }
    }
}
