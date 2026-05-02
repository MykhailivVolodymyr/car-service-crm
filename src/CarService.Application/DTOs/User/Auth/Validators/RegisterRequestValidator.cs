using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.User.Auth.Validators
{
    public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("ПІБ є обов'язковим")
                .MinimumLength(5).WithMessage("ПІБ має містити мінімум 5 символів")
                .MaximumLength(100).WithMessage("ПІБ занадто довге");

            RuleFor(x => x.Email)
              .NotEmpty().WithMessage("Email є обов'язковим")
              .EmailAddress().WithMessage("Некоректний формат Email")
              .MaximumLength(150).WithMessage("Email занадто довгий");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Пароль є обов'язковим")
                .MinimumLength(6).WithMessage("Пароль має бути не менше 6 символів")
                .Matches(@"[A-Z]").WithMessage("Пароль має містити хоча б одну велику літеру")
                .Matches(@"[a-z]").WithMessage("Пароль має містити хоча б одну малу літеру")
                .Matches(@"[0-9]").WithMessage("Пароль має містити хоча б одну цифру");
               // .Matches(@"[\!\?\*\.]").WithMessage("Пароль має містити хоча б один спецсимвол (!?*.)");

            RuleFor(x => x.Phone)
                .Matches(@"^\+380\d{9}$")
                .WithMessage("Номер телефону має бути у форматі +380XXXXXXXXX")
                .When(x => !string.IsNullOrEmpty(x.Phone));
        }
    }
}
