using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Service.CreateService.Validators
{
    public class CreateServiceValidator : AbstractValidator<CreateServiceDto>
    {
        public CreateServiceValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Назва послуги обов'язкова")
                .MaximumLength(200).WithMessage("Назва занадто довга (макс. 200 символів)");

            RuleFor(x => x.DefaultPrice)
                .GreaterThanOrEqualTo(0).WithMessage("Ціна не може бути від'ємною");

            RuleFor(x => x)
                .Must(x => x.CategoryId.HasValue || !string.IsNullOrWhiteSpace(x.CategoryName))
                .WithMessage("Необхідно вибрати існуючу категорію або ввести назву для нової")
                .WithName("Category");

            RuleFor(x => x.CategoryName)
                .MaximumLength(100).WithMessage("Назва категорії занадто довга")
                .When(x => !string.IsNullOrWhiteSpace(x.CategoryName));
        }
    }
}
