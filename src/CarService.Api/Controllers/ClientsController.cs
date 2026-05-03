using CarService.Application.DTOs.Client.CreateClient;
using CarService.Application.DTOs.Client.GetClient;
using CarService.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarService.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ClientsController : ControllerBase
    {
        private readonly IClientService _clientService;

        public ClientsController(IClientService clientService)
        {
            _clientService = clientService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientDto>>> GetAll()
        {
            var clients = await _clientService.GetAllAsync();
            return Ok(clients);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ClientDto>> GetById(int id)
        {
            var client = await _clientService.GetByIdAsync(id);
            return Ok(client);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ClientDto>>> Search([FromQuery] string searchTerm)
        {
            var clients = await _clientService.SearchAsync(searchTerm);
            return Ok(clients);
        }

        [HttpPost]
        [Authorize(Roles = "Менеджер")]
        public async Task<ActionResult<ClientDto>> Create([FromBody] CreateClientDto dto)
        {
            var result = await _clientService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateClientDto dto)
        {
            await _clientService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> Delete(int id)
        {
            await _clientService.DeleteAsync(id);
            return NoContent();
        }
    }
}
