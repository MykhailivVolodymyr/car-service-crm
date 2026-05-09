using CarService.Application.DTOs.Analytics;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services
{
    public interface IAnalyticsService
    {
        Task<GeneralAnalyticsDto> GetGeneralAnalyticsAsync(AnalyticsRequestDto request);
        Task<IEnumerable<VehiclePopularityDto>> GetTopVehiclesAsync(AnalyticsRequestDto request);
        Task<IEnumerable<ClientPopularityDto>> GetTopClientsAsync(AnalyticsRequestDto request);
        Task<IEnumerable<ServicePopularityDto>> GetTopServicesAsync(AnalyticsRequestDto request);
        Task<IEnumerable<DailyActivityDto>> GetDailyActivityAsync(AnalyticsRequestDto request);
        Task<IEnumerable<HourlyLoadDto>> GetHourlyLoadAsync(AnalyticsRequestDto request);

    }
}
