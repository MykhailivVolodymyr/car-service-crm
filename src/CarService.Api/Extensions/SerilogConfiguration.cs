using Serilog;
using Serilog.Events;

namespace CarService.Api.Extensions
{
    public static class SerilogConfiguration
    {
        public static void AddSerilogLogging(this WebApplicationBuilder builder)
        {
            var logPath = Path.Combine(builder.Environment.ContentRootPath, "Logs");
            if (!Directory.Exists(logPath))
            {
                Directory.CreateDirectory(logPath);
            }

            builder.Host.UseSerilog((context, services, configuration) =>
            {
                configuration
                    .ReadFrom.Configuration(context.Configuration)
                    .Enrich.FromLogContext()

                    .WriteTo.Console(outputTemplate:
                        "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")

                    .WriteTo.File(
                        path: Path.Combine(logPath, "all-.txt"),
                        rollingInterval: RollingInterval.Day,
                        retainedFileCountLimit: 7,
                        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")

                    .WriteTo.File(
                        path: Path.Combine(logPath, "errors-.txt"),
                        restrictedToMinimumLevel: LogEventLevel.Error,
                        rollingInterval: RollingInterval.Day,
                        retainedFileCountLimit: 14,
                        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}");
            });
        }
    }
}
