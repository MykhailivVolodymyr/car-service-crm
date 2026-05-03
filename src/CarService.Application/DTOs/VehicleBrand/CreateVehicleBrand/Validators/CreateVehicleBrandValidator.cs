using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.VehicleBrand.CreateVehicleBrand.Validators
{
    public class CreateVehicleBrandValidator : AbstractValidator<CreateVehicleBrandDto>
    {
        public CreateVehicleBrandValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Назва бренду є обов'язковою")
                .MinimumLength(2).WithMessage("Назва бренду має містити мінімум 2 символи")
                .MaximumLength(50).WithMessage("Назва бренду занадто довга");
        }
    }
}
