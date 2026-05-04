using CarService.Application.DTOs.WorkPost.CreateWorkPost;
using CarService.Application.DTOs.WorkPost.GetWorkPost;
using CarService.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarService.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WorkPostsController : ControllerBase
    {
        private readonly IWorkPostService _workPostService;

        public WorkPostsController(IWorkPostService workPostService)
        {
            _workPostService = workPostService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkPostDto>>> GetAll([FromQuery] bool onlyActive = false)
        {
            var posts = await _workPostService.GetAllAsync(onlyActive);
            return Ok(posts);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WorkPostDto>> GetById(int id)
        {
            var post = await _workPostService.GetByIdAsync(id);
            return Ok(post);
        }

        [HttpPost]
        public async Task<ActionResult<WorkPostDto>> Create([FromBody] CreateWorkPostDto dto)
        {
            var result = await _workPostService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateWorkPostDto dto)
        {
            await _workPostService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            await _workPostService.ToggleStatusAsync(id);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _workPostService.DeleteAsync(id);
            return NoContent();
        }
    }
}
