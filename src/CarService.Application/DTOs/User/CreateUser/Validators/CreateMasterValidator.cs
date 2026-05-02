using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.User.CreateUser.Validators
{
    public class CreateMasterValidator : AbstractValidator<CreateMasterDto>
    {
        public CreateMasterValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("ПІБ є обов'язковим")
                .MinimumLength(5).WithMessage("ПІБ має містити мінімум 5 символів")
                .MaximumLength(100).WithMessage("ПІБ занадто довге")
                .Must(name => name.Trim().Contains(" "))
                .WithMessage("Введіть повне ПІБ (мінімум два слова для коректної генерації пароля)");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email є обов'язковим")
                .EmailAddress().WithMessage("Некоректний формат Email")
                .MaximumLength(150).WithMessage("Email занадто довгий");

            RuleFor(x => x.Phone)
                .Matches(@"^\+380\d{9}$")
                .WithMessage("Формат телефону має бути +380XXXXXXXXX")
                .When(x => !string.IsNullOrEmpty(x.Phone));
        }
    }
}
