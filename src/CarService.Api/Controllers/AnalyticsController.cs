using CarService.Application.DTOs.Analytics;
using CarService.Application.DTOs.Analytics.InventoryPage;
using CarService.Application.DTOs.Analytics.MainPaige;
using CarService.Application.DTOs.Analytics.MasterPage;
using CarService.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarService.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpGet("general")]
        public async Task<ActionResult<GeneralAnalyticsDto>> GetGeneralAnalytics([FromQuery] AnalyticsRequestDto request)
        {
            var analytics = await _analyticsService.GetGeneralAnalyticsAsync(request);
            return Ok(analytics);
        }

        [HttpGet("top-vehicles")]
        public async Task<ActionResult<IEnumerable<VehiclePopularityDto>>> GetTopVehicles([FromQuery] AnalyticsRequestDto request)
        {
            var result = await _analyticsService.GetTopVehiclesAsync(request);
            return Ok(result);
        }

        [HttpGet("top-clients")]
        public async Task<ActionResult<IEnumerable<ClientPopularityDto>>> GetTopClients([FromQuery] AnalyticsRequestDto request)
        {
            var topClients = await _analyticsService.GetTopClientsAsync(request);
            return Ok(topClients);
        }

        [HttpGet("top-services")]
        public async Task<ActionResult<IEnumerable<ServicePopularityDto>>> GetTopServices([FromQuery] AnalyticsRequestDto request)
        {
            var topServices = await _analyticsService.GetTopServicesAsync(request);
            return Ok(topServices);
        }

        [HttpGet("daily-activity")]
        public async Task<ActionResult<IEnumerable<DailyActivityDto>>> GetDailyActivity([FromQuery] AnalyticsRequestDto request)
        {
            var activity = await _analyticsService.GetDailyActivityAsync(request);
            return Ok(activity);
        }

        [HttpGet("hourly-load")]
        public async Task<ActionResult<IEnumerable<HourlyLoadDto>>> GetHourlyLoad([FromQuery] AnalyticsRequestDto request)
        {
            var load = await _analyticsService.GetHourlyLoadAsync(request);
            return Ok(load);
        }

        // main paige
        [HttpGet("dashboard-stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
        {
            var stats = await _analyticsService.GetDashboardStatsAsync();
            return Ok(stats);
        }

        [HttpGet("operational-stats")]
        public async Task<ActionResult<OperationalStatsDto>> GetOperationalStats()
        {
            var stats = await _analyticsService.GetOperationalStatsAsync();
            return Ok(stats);
        }

        [HttpGet("inventory-stats")]
        public async Task<ActionResult<InventoryStatsDto>> GetInventoryStats()
        {
            var stats = await _analyticsService.GetInventoryStatsAsync();
            return Ok(stats);
        }
    }
}
    