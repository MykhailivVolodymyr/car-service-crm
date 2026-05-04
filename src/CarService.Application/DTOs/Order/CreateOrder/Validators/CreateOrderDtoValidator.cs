using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Order.CreateOrder.Validators
{
    public class CreateOrderDtoValidator : AbstractValidator<CreateOrderDto>
    {
        public CreateOrderDtoValidator()
        {
            RuleFor(x => x.StatusId)
                .NotEmpty().WithMessage("Статус замовлення є обов'язковим.");

            RuleFor(x => x.Mileage)
                .GreaterThanOrEqualTo(0).When(x => x.Mileage.HasValue)
                .WithMessage("Пробіг не може бути від'ємним.");

            // 3. Умовна валідація для автомобіля
            // Якщо VehicleId не вказано, вимагаємо дані для створення нового авто
            When(x => !x.VehicleId.HasValue, () =>
            {
                RuleFor(x => x.Vin)
                    .NotEmpty().WithMessage("VIN-код обов'язковий, якщо не обрано існуюче авто.")
                    .Length(17).WithMessage("VIN-код має містити рівно 17 символів.");

                RuleFor(x => x.LicensePlate)
                    .NotEmpty().WithMessage("Держномер обов'язковий, якщо не обрано існуюче авто.");

                RuleFor(x => x.Year)
                    .NotNull().WithMessage("Рік випуску обов'язковий.")
                    .InclusiveBetween(1900, DateTime.Now.Year + 1)
                    .WithMessage($"Рік має бути в діапазоні від 1900 до {DateTime.Now.Year + 1}.");

                // Валідація моделі (або ID моделі, або назви моделі + бренду)
                When(x => !x.ModelId.HasValue, () =>
                {
                    RuleFor(x => x.BrandName)
                        .NotEmpty().WithMessage("Назва бренду обов'язкова, якщо не вказано ModelId.");

                    RuleFor(x => x.ModelName)
                        .NotEmpty().WithMessage("Назва моделі обов'язкова, якщо не вказано ModelId.");
                });
            });

            // 4. Умовна валідація для клієнта
            // Якщо ми створюємо нове авто, нам потрібен або ClientId, або дані для нового клієнта
            When(x => !x.VehicleId.HasValue && !x.ClientId.HasValue, () =>
            {
                RuleFor(x => x.ClientPhone)
                    .NotEmpty().WithMessage("Номер телефону клієнта обов'язковий для нового автомобіля.")
                    .Matches(@"^\+?380\d{9}$").WithMessage("Формат телефону має бути +380XXXXXXXXX.");

                RuleFor(x => x.ClientFullName)
                    .NotEmpty().WithMessage("ПІБ клієнта обов'язкове для реєстрації.");

                RuleFor(x => x.ClientEmail)
                    .EmailAddress().When(x => !string.IsNullOrEmpty(x.ClientEmail))
                    .WithMessage("Некоректний формат Email.");
            });

            // 5. Нотатки
            RuleFor(x => x.Notes)
                .MaximumLength(1000).WithMessage("Нотатки не можуть перевищувати 1000 символів.");
        }
    }
}
