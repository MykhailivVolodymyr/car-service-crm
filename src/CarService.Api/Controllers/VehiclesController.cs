using CarService.Application.DTOs.Vehicle.CreateVehicle;
using CarService.Application.DTOs.Vehicle.GetVehicle;
using CarService.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarService.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class VehiclesController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;

        public VehiclesController(IVehicleService vehicleService)
        {
            _vehicleService = vehicleService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<VehicleDto>>> GetAll()
        {
            var vehicles = await _vehicleService.GetAllAsync();
            return Ok(vehicles);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<VehicleDto>> GetById(int id)
        {
            var vehicle = await _vehicleService.GetByIdAsync(id);
            return Ok(vehicle);
        }

        [HttpGet("client/{clientId:int}")]
        public async Task<ActionResult<IEnumerable<VehicleDto>>> GetByClient(int clientId)
        {
            var vehicles = await _vehicleService.GetByClientIdAsync(clientId);
            return Ok(vehicles);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<VehicleDto>>> Search([FromQuery] string searchTerm)
        {
            var results = await _vehicleService.SearchAsync(searchTerm);
            return Ok(results);
        }

        [HttpGet("by-vin/{vin}")]
        public async Task<ActionResult<VehicleDto>> GetByVin(string vin)
        {
            var vehicle = await _vehicleService.GetByVinAsync(vin);
            if (vehicle == null) return NotFound($"Автомобіль з VIN {vin} не знайдено.");
            return Ok(vehicle);
        }

        [HttpGet("by-plate/{plate}")]
        public async Task<ActionResult<VehicleDto>> GetByPlate(string plate)
        {
            var vehicle = await _vehicleService.GetByLicensePlateAsync(plate);
            if (vehicle == null) return NotFound($"Автомобіль з номером {plate} не знайдено.");
            return Ok(vehicle);
        }

        [HttpGet("exists")]
        public async Task<ActionResult<bool>> CheckExists([FromQuery] string? vin, [FromQuery] string? plate)
        {
            if (string.IsNullOrEmpty(vin) && string.IsNullOrEmpty(plate))
                return BadRequest("Необхідно вказати VIN або держномер для перевірки.");

            var exists = await _vehicleService.ExistsAsync(vin ?? "", plate ?? "");
            return Ok(exists);
        }

        [HttpPost]
        [Authorize(Roles = "Менеджер")] 
        public async Task<ActionResult<VehicleDto>> Create([FromBody] CreateVehicleDto dto)
        {
            var result = await _vehicleService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateVehicleDto dto)
        {
            await _vehicleService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> Delete(int id)
        {
            await _vehicleService.DeleteAsync(id);
            return NoContent();
        }
    }
}
