using CarService.Application.DTOs.VehicleModel.CreateVehicleModel;
using CarService.Application.DTOs.VehicleModel.GetVehicleModel;
using CarService.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarService.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VehicleModelsController : ControllerBase
    {
        private readonly IVehicleModelService _modelService;

        public VehicleModelsController(IVehicleModelService modelService)
        {
            _modelService = modelService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<VehicleModelDto>>> GetAll()
        {
            var models = await _modelService.GetAllAsync();
            return Ok(models);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<VehicleModelDto>> GetById(int id)
        {
            var model = await _modelService.GetByIdAsync(id);
            return Ok(model);
        }

        [HttpGet("brand/{brandId:int}")]
        public async Task<ActionResult<IEnumerable<VehicleModelDto>>> GetByBrand(int brandId)
        {
            var models = await _modelService.GetByBrandAsync(brandId);
            return Ok(models);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<VehicleModelDto>>> Search([FromQuery] string searchTerm)
        {
            var models = await _modelService.SearchAsync(searchTerm);
            return Ok(models);
        }

        [HttpPost]
        [Authorize(Roles = "Менеджер")]
        public async Task<ActionResult<VehicleModelDto>> Create([FromBody] CreateVehicleModelDto dto)
        {
            var result = await _modelService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateVehicleModelDto dto)
        {
            await _modelService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> Delete(int id)
        {
            await _modelService.DeleteAsync(id);
            return NoContent();
        }
    }
}
