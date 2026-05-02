using CarService.Application.DTOs.User.CreateUser;
using CarService.Application.DTOs.User.GetUser;
using CarService.Application.DTOs.User.UpdateUser;
using CarService.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarService.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<UserDto>> GetById(int id)
        {
            var user = await _userService.GetByIdAsync(id);
            return Ok(user);
        }

        [HttpPost("masters")]
        [Authorize(Roles = "Менеджер")]
        public async Task<ActionResult<MasterCreatedResponseDto>> CreateMaster([FromBody] CreateMasterDto createDto)
        {
            var result = await _userService.CreateMasterAsync(createDto);
            return Ok(result);
        }

        [HttpGet("masters")]
        [Authorize(Roles = "Менеджер")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAllMasters()
        {
            var masters = await _userService.GetUsersByRoleAsync("Майстер");
            return Ok(masters);
        }

        [HttpGet("masters/active")]
        [Authorize(Roles = "Менеджер")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetActiveMasters()
        {
            var masters = await _userService.GetActiveUsersByRoleAsync("Майстер");
            return Ok(masters);
        }

        [HttpGet("managers")]
        [Authorize(Roles = "Менеджер")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAllManagers()
        {
            var managers = await _userService.GetUsersByRoleAsync("Менеджер");
            return Ok(managers);
        }


        [HttpPut]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> Update([FromBody] UserUpdateDto updateDto)
        {
            await _userService.UpdateUserAsync(updateDto);
            return NoContent();
        }

        [HttpPatch("{id:int}/toggle-status")]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            await _userService.ToggleStatusAsync(id);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Менеджер")]
        public async Task<IActionResult> Delete(int id)
        {
            await _userService.DeleteUserAsync(id);
            return NoContent();
        }
    }
}