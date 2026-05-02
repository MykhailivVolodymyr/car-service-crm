using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.User.UpdateUser.Validators
{
    public class UserUpdateValidator : AbstractValidator<UserUpdateDto>
    {
        public UserUpdateValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);

            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("ПІБ є обов'язковим")
                .MinimumLength(5).WithMessage("ПІБ має містити мінімум 5 символів");

            RuleFor(x => x.Phone)
                .Matches(@"^\+380\d{9}$")
                .WithMessage("Формат телефону має бути +380XXXXXXXXX")
                .When(x => !string.IsNullOrEmpty(x.Phone));

            RuleFor(x => x.RoleId).GreaterThan(0).WithMessage("Виберіть коректну роль");
        }
    }
}
