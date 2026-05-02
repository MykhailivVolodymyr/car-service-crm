using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.User.Auth.Validators
{
    public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
    {
        public LoginRequestValidator()
        {
            //RuleFor(x => x.Email)
            // .NotEmpty().WithMessage("Email не може бути порожнім")
            // .EmailAddress().WithMessage("Введіть коректний Email")
            // .MaximumLength(150).WithMessage("Email занадто довгий");

            //RuleFor(x => x.Password)
            //    .NotEmpty().WithMessage("Пароль не може бути порожнім")
            //    .MinimumLength(6).WithMessage("Пароль має містити мінімум 6 символів")
            //    .Matches(@"[A-Z]").WithMessage("Пароль має містити хоча б одну велику літеру")
            //    .Matches(@"[0-9]").WithMessage("Пароль має містити хоча б одну цифру");
        }
    }
}
