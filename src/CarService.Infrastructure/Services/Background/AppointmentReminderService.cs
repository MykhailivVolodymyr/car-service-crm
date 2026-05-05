using CarService.Application.Services;
using CarService.Domain.Abstractions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Infrastructure.Services.Background
{
    public class AppointmentReminderService : BackgroundService
    {
        private readonly IServiceProvider _services;
        private readonly ILogger<AppointmentReminderService> _logger;

        public AppointmentReminderService(IServiceProvider services, ILogger<AppointmentReminderService> logger)
        {
            _services = services;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Appointment Reminder Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now;

                // Виконуємо розсилку о 8:00 ранку
                if (now.Hour == 8)
                {
                    _logger.LogInformation("It's 8 AM. Starting to send daily reminders...");
                    await SendDailyReminders();

                    await Task.Delay(TimeSpan.FromMinutes(61), stoppingToken);
                }

                await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
            }
        }

        private async Task SendDailyReminders()
        {
            using var scope = _services.CreateScope();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

            var today = DateTime.Today;

            try
            {
                var todaySchedules = await unitOfWork.Schedules.GetAsync(
                    s => s.StartTime.Date == today && s.OrderId != null
                );

                foreach (var schedule in todaySchedules)
                {
                    var client = schedule.Order?.Vehicle?.Client;
                    var vehicle = schedule.Order?.Vehicle;

                    if (client != null && !string.IsNullOrWhiteSpace(client.Email))
                    {
                        string time = schedule.StartTime.ToString("HH:mm");
                        string message = $@"
                        <h2>Нагадування про візит</h2>
                        <p>Шановний {client.FullName}, чекаємо на вас сьогодні в нашому автосервісі!</p>
                        <p>Ваше авто: <b>{vehicle?.Model.Brand.Name} {vehicle?.Model.Name}</b></p>
                        <p>Час запису: <b>{time}</b></p>
                        <p>Місце: Пост №{schedule.PostId}</p>
                        <br>
                        <p>CarService</p>";

                        await notificationService.SendNotificationAsync(
                            client.Email,
                            message,
                            "Нагадування про візит - CarService"
                        );

                        _logger.LogInformation("Reminder sent to {Email} for appointment at {Time}", client.Email, time);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while sending daily reminders.");
            }
        }
    }
}
