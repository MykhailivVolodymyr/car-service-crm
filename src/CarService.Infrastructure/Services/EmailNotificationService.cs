using CarService.Application.Services;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MimeKit.Text;
using System;
using System.Collections.Generic;
using System.Linq;
using MailKit.Net.Smtp;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Infrastructure.Services
{
    public class EmailNotificationService : INotificationService
    {
        private readonly IConfiguration _config;

        public EmailNotificationService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendNotificationAsync(
            string recipient,
            string message,
            string? subject = null,
            byte[]? attachment = null,
            string? fileName = null)
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress("CarService", _config["EmailSettings:From"]));
            email.To.Add(MailboxAddress.Parse(recipient));
            email.Subject = subject ?? "Сповіщення від CarService";

            // Використовуємо BodyBuilder для створення листа з вкладенням
            var builder = new BodyBuilder
            {
                HtmlBody = message
            };

            // Якщо передано масив байтів — додаємо його як вкладення
            if (attachment != null && !string.IsNullOrEmpty(fileName))
            {
                builder.Attachments.Add(fileName, attachment);
            }

            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();

            try
            {
                await smtp.ConnectAsync(
                    _config["EmailSettings:Host"],
                    int.Parse(_config["EmailSettings:Port"]),
                    SecureSocketOptions.StartTls);

                await smtp.AuthenticateAsync(
                    _config["EmailSettings:Username"],
                    _config["EmailSettings:Password"]);

                await smtp.SendAsync(email);
            }
            finally
            {
                await smtp.DisconnectAsync(true);
            }
        }


    }
}
