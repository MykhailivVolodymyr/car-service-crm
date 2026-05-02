using CarService.Application.DTOs.Service.CreateService;
using CarService.Application.DTOs.Service.GetService;
using CarService.Application.DTOs.Service.UpdateService;
using CarService.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarService.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ServicesController : ControllerBase
    {
        private readonly IServiceAppService _serviceAppService;

        public ServicesController(IServiceAppService serviceAppService)
        {
            _serviceAppService = serviceAppService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServiceDto>>> GetAll()
        {
            var services = await _serviceAppService.GetAllAsync();
            return Ok(services);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ServiceDto>> GetById(int id)
        {
            var service = await _serviceAppService.GetByIdAsync(id);
            return Ok(service);
        }

        [HttpGet("category/{categoryId:int}")]
        public async Task<ActionResult<IEnumerable<ServiceDto>>> GetByCategory(int categoryId)
        {
            var services = await _serviceAppService.GetByCategoryAsync(categoryId);
            return Ok(services);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ServiceDto>>> Search([FromQuery] string searchTerm)
        {
            var services = await _serviceAppService.SearchAsync(searchTerm);
            return Ok(services);
        }

        [HttpPost]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> Create([FromBody] CreateServiceDto dto)
        {
            await _serviceAppService.CreateAsync(dto);
            return Ok(new { message = "Послугу успішно створено" });
        }

        [HttpPut]
        [Authorize(Roles = "Менеджер")] 
        public async Task<IActionResult> Update([FromBody] UpdateServiceDto dto)
        {
            await _serviceAppService.UpdateAsync(dto);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> Delete(int id)
        {
            await _serviceAppService.DeleteAsync(id);
            return NoContent();
        }
    }
}
