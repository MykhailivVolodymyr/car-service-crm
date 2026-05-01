using System.Diagnostics;
using System.Text;

namespace CarService.Api.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;
        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (!context.Request.Path.StartsWithSegments("/api"))
            {
                await _next(context);
                return;
            }

            var stopwatch = Stopwatch.StartNew();
            var request = context.Request;

            request.EnableBuffering();
            var requestBody = await ReadRequestBody(request);

            var originalBodyStream = context.Response.Body;
            using var responseBody = new MemoryStream();
            context.Response.Body = responseBody;

            try
            {
                await _next(context);

                stopwatch.Stop();

                var responseContent = await ReadResponseBody(context.Response);

                _logger.LogInformation(
                    "HTTP Request Details:\n" +
                    "- IP: {IP}\n" +
                    "- URL: {Method} {Url}\n" +
                    "- Status: {StatusCode}\n" +
                    "- Request Content: {ReqBody}\n" +
                    "- Response Content: {ResBody}\n" +
                    "- Elapsed Time: {Elapsed}ms",
                    context.Connection.RemoteIpAddress,
                    request.Method, request.Path,
                    context.Response.StatusCode,
                    requestBody,
                    responseContent,
                    stopwatch.ElapsedMilliseconds);

                await responseBody.CopyToAsync(originalBodyStream);
            }
            finally
            {
                context.Response.Body = originalBodyStream;
            }
        }

        private static async Task<string> ReadRequestBody(HttpRequest request)
        {
            using var reader = new StreamReader(request.Body, Encoding.UTF8, detectEncodingFromByteOrderMarks: false, leaveOpen: true);
            var body = await reader.ReadToEndAsync();
            request.Body.Position = 0;
            return string.IsNullOrWhiteSpace(body) ? "[empty]" : body;
        }

        private static async Task<string> ReadResponseBody(HttpResponse response)
        {
            response.Body.Seek(0, SeekOrigin.Begin);
            var text = await new StreamReader(response.Body).ReadToEndAsync();
            response.Body.Seek(0, SeekOrigin.Begin);
            return string.IsNullOrWhiteSpace(text) ? "[empty]" : text;
        }
    }
}
