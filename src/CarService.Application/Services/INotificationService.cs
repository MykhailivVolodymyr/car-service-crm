using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services
{
    public interface INotificationService
    {
        Task SendNotificationAsync(
            string recipient,
            string message,
            string? subject = null,
            byte[]? attachment = null,
            string? fileName = null);
    }
}
