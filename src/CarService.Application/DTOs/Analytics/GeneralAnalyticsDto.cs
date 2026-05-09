using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Analytics
{
    public record GeneralAnalyticsDto(
        int TotalAppointments,       // Загальна кількість записів у розкладі
        int CompletedOrders,         // Скільки замовлень було закрито
        decimal TotalRevenue,        // Загальний дохід (сума TotalAmount)
        decimal AverageCheck,        // Середній чек
        double AvgAppointmentsPerDay, // Середня кількість записів на день
        double ConversionRate        // Відсоток успішно завершених замовлень (%)
    );
}
