using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.VehicleModel.CreateVehicleModel.Validators
{
    public class CreateVehicleModelValidator : AbstractValidator<CreateVehicleModelDto>
    {
        public CreateVehicleModelValidator()
        {
            RuleFor(x => x.ModelName)
                .NotEmpty().WithMessage("Назва моделі є обов'язковою")
                .MaximumLength(100).WithMessage("Назва моделі занадто довга");

            RuleFor(x => x)
                .Must(x => x.BrandId.HasValue || !string.IsNullOrWhiteSpace(x.BrandName))
                .WithMessage("Необхідно вибрати існуючий бренд або ввести назву нового бренду");
        }
    }
}
