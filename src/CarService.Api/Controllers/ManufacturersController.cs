using CarService.Application.DTOs.Manufacturer.CreateManufacturer;
using CarService.Application.DTOs.Manufacturer.GetManufacturer;
using CarService.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarService.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ManufacturersController : ControllerBase
    {
        private readonly IManufacturerService _manufacturerService;

        public ManufacturersController(IManufacturerService manufacturerService)
        {
            _manufacturerService = manufacturerService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ManufacturerDto>>> GetAll()
        {
            var manufacturers = await _manufacturerService.GetAllAsync();
            return Ok(manufacturers);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ManufacturerDto>> GetById(int id)
        {
            var manufacturer = await _manufacturerService.GetByIdAsync(id);
            return Ok(manufacturer);
        }

        [HttpPost]
        [Authorize(Roles = "Менеджер")]
        public async Task<ActionResult<ManufacturerDto>> Create([FromBody] CreateManufacturerDto dto)
        {
            var result = await _manufacturerService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateManufacturerDto dto)
        {
            await _manufacturerService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> Delete(int id)
        {
            await _manufacturerService.DeleteAsync(id);
            return NoContent();
        }
    }
}
