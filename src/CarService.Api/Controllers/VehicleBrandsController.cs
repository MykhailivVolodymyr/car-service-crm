using CarService.Application.DTOs.VehicleBrand.CreateVehicleBrand;
using CarService.Application.DTOs.VehicleBrand.GetVehicleBrand;
using CarService.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarService.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VehicleBrandsController : ControllerBase
    {
        private readonly IVehicleBrandService _brandService;

        public VehicleBrandsController(IVehicleBrandService brandService)
        {
            _brandService = brandService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<VehicleBrandDto>>> GetAll()
        {
            var brands = await _brandService.GetAllAsync();
            return Ok(brands);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<VehicleBrandDto>> GetById(int id)
        {
            var brand = await _brandService.GetByIdAsync(id);
            return Ok(brand);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<VehicleBrandDto>>> Search([FromQuery] string searchTerm)
        {
            var brands = await _brandService.SearchAsync(searchTerm);
            return Ok(brands);
        }

        [HttpPost]
        [Authorize(Roles = "Менеджер")]
        public async Task<ActionResult<VehicleBrandDto>> Create([FromBody] CreateVehicleBrandDto dto)
        {
            var result = await _brandService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateVehicleBrandDto dto)
        {
            await _brandService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> Delete(int id)
        {
            await _brandService.DeleteAsync(id);
            return NoContent();
        }
    }
}
