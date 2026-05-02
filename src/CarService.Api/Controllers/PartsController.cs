using CarService.Application.DTOs.Part.CreatePart;
using CarService.Application.DTOs.Part.GetPart;
using CarService.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarService.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PartsController : ControllerBase
    {
        private readonly IPartService _partService;

        public PartsController(IPartService partService)
        {
            _partService = partService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PartDto>>> GetAll()
        {
            var parts = await _partService.GetAllAsync();
            return Ok(parts);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<PartDto>> GetById(int id)
        {
            var part = await _partService.GetByIdAsync(id);
            return Ok(part);
        }

        [HttpGet("category/{categoryId:int}")]
        public async Task<ActionResult<IEnumerable<PartDto>>> GetByCategory(int categoryId)
        {
            var parts = await _partService.GetByCategoryAsync(categoryId);
            return Ok(parts);
        }

        [HttpGet("manufacturer/{manufacturerId:int}")]
        public async Task<ActionResult<IEnumerable<PartDto>>> GetByManufacturer(int manufacturerId)
        {
            var parts = await _partService.GetByManufacturerAsync(manufacturerId);
            return Ok(parts);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<PartDto>>> Search([FromQuery] string searchTerm)
        {
            var parts = await _partService.SearchAsync(searchTerm);
            return Ok(parts);
        }

        [HttpGet("low-stock")]
        public async Task<ActionResult<IEnumerable<PartDto>>> GetLowStock([FromQuery] decimal threshold = 5)
        {
            var parts = await _partService.GetLowStockAsync(threshold);
            return Ok(parts);
        }

        [HttpPatch("{id:int}/adjust-quantity")]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> AdjustQuantity(int id, [FromQuery] decimal amount)
        {
            await _partService.AdjustQuantityAsync(id, amount);
            return NoContent();
        }

        [HttpPost]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> Create([FromBody] CreatePartDto dto)
        {
            await _partService.CreateAsync(dto);
            return Ok(new { message = "Part successfully added to warehouse" });
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> Update(int id, [FromBody] CreatePartDto dto)
        {
            await _partService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> Delete(int id)
        {
            await _partService.DeleteAsync(id);
            return NoContent();
        }
    }
}
