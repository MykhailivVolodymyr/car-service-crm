using CarService.Application.Exceptions;
using System.Net;

namespace CarService.Api.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly bool _isDevelopment;

        public ExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlingMiddleware> logger,
            IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _isDevelopment = env.IsDevelopment();
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                LogException(context, ex);
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var statusCode = exception switch
            {
                NotFoundException => HttpStatusCode.NotFound,
                BadRequestException => HttpStatusCode.BadRequest,
                ForbiddenException => HttpStatusCode.Forbidden,
                UnauthorizedAccessException => HttpStatusCode.Unauthorized,
                OperationCanceledException => HttpStatusCode.NoContent,
                _ => HttpStatusCode.InternalServerError
            };

            var message = statusCode switch
            {
                HttpStatusCode.InternalServerError => "An unexpected server error occurred. Please try again later.",
                _ => exception.Message
            };

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            var response = new
            {
                StatusCode = (int)statusCode,
                Message = message,
                Details = _isDevelopment ? exception.ToString() : null
            };

            await context.Response.WriteAsJsonAsync(response);
        }

        private void LogException(HttpContext context, Exception ex)
        {
            var path = context.Request.Path;
            var type = ex.GetType().Name;
            var message = ex.Message;

            if (ex is NotFoundException || ex is BadRequestException || ex is UnauthorizedAccessException ||
                ex is OperationCanceledException || ex is ForbiddenException)
            {
                _logger.LogWarning("Client error: {Message}. Path: {Path}. Type: {Type}", message, path, type);
            }
            else
            {
                _logger.LogError(ex, "Unhandled server exception: {Message}. Path: {Path}. Type: {Type}", message, path, type);
            }
        }
    }
}
