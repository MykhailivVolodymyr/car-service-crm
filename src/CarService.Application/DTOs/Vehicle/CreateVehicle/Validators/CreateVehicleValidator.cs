using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Vehicle.CreateVehicle.Validators
{
    public class CreateVehicleValidator : AbstractValidator<CreateVehicleDto>
    {
        public CreateVehicleValidator()
        {
            // --- Валідація Клієнта ---
            RuleFor(x => x)
                .Must(x => x.ClientId.HasValue || !string.IsNullOrWhiteSpace(x.ClientPhone))
                .WithMessage("Необхідно вибрати існуючого клієнта або вказати номер телефону для нового.");

            RuleFor(x => x.ClientPhone)
                .Matches(@"^\+380\d{9}$")
                .WithMessage("Номер телефону має бути у форматі +380XXXXXXXXX")
                .When(x => !string.IsNullOrWhiteSpace(x.ClientPhone));

            RuleFor(x => x.ClientFullName)
                .NotEmpty().WithMessage("Прізвище та ім'я клієнта є обов'язковими для створення нового профілю.")
                .When(x => !x.ClientId.HasValue && !string.IsNullOrWhiteSpace(x.ClientPhone));

            RuleFor(x => x.ClientEmail)
                .EmailAddress().WithMessage("Некоректний формат Email.")
                .When(x => !string.IsNullOrWhiteSpace(x.ClientEmail));


            // --- Валідація Моделі та Бренду ---
            RuleFor(x => x)
                .Must(x => x.ModelId.HasValue || (!string.IsNullOrWhiteSpace(x.BrandName) && !string.IsNullOrWhiteSpace(x.ModelName)))
                .WithMessage("Необхідно вибрати модель зі списку або вказати назву нового бренду та моделі.");

            RuleFor(x => x.BrandName)
                .MaximumLength(50).WithMessage("Назва бренду занадто довга.")
                .When(x => !string.IsNullOrWhiteSpace(x.BrandName));

            RuleFor(x => x.ModelName)
                .MaximumLength(50).WithMessage("Назва моделі занадто довга.")
                .When(x => !string.IsNullOrWhiteSpace(x.ModelName));


            // --- Валідація Даних Авто ---
            RuleFor(x => x.Vin)
                .NotEmpty().WithMessage("VIN-код є обов'язковим.")
                .Length(17).WithMessage("VIN-код має містити рівно 17 символів.");

            RuleFor(x => x.LicensePlate)
                .NotEmpty().WithMessage("Держномер є обов'язковим.")
                .MinimumLength(2).WithMessage("Держномер занадто короткий.")
                .MaximumLength(15).WithMessage("Держномер занадто довгий.");

            RuleFor(x => x.Year)
                .InclusiveBetween(1900, DateTime.Now.Year + 1)
                .WithMessage($"Рік випуску має бути в діапазоні від 1900 до {DateTime.Now.Year + 1}.");
        }
    }
}
