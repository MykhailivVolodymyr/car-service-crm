using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Client.CreateClient.Validators
{
    public class CreateClientValidator : AbstractValidator<CreateClientDto>
    {
        public CreateClientValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Прізвище та ім'я є обов'язковими")
                .MinimumLength(2).WithMessage("Прізвище та ім'я мають містити принаймні 2 символи")
                .MaximumLength(100).WithMessage("Прізвище та ім'я занадто довгі");

            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("Номер телефону є обов'язковим")
                .Matches(@"^\+380\d{9}$").WithMessage("Формат телефону має бути +380XXXXXXXXX");

            RuleFor(x => x.Email)
                .EmailAddress().WithMessage("Некоректний формат Email")
                .MaximumLength(150).WithMessage("Email занадто довгий")
                .When(x => !string.IsNullOrEmpty(x.Email));
        }
    }
}
