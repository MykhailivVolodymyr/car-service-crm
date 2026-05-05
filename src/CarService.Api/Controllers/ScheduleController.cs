using CarService.Application.DTOs.Schedule.CreateSchedule;
using CarService.Application.DTOs.Schedule.GetSchedule;
using CarService.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarService.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ScheduleController : ControllerBase
    {
        private readonly IScheduleService _scheduleService;

        public ScheduleController(IScheduleService scheduleService)
        {
            _scheduleService = scheduleService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetAll()
        {
            var result = await _scheduleService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ScheduleDto>> GetById(int id)
        {
            var result = await _scheduleService.GetByIdAsync(id);
            return Ok(result);
        }

        [HttpGet("period")]
        public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetByPeriod(
            [FromQuery] DateTime start,
            [FromQuery] DateTime end)
        {
            var result = await _scheduleService.GetByPeriodAsync(start, end);
            return Ok(result);
        }

        [HttpGet("mechanic/{mechanicId:int}")]
        public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetByMechanic(
            int mechanicId,
            [FromQuery] DateTime? date)
        {
            var result = await _scheduleService.GetByMechanicAsync(mechanicId, date);
            return Ok(result);
        }

        [HttpGet("post/{postId:int}")]
        public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetByPost(
            int postId,
            [FromQuery] DateTime? date)
        {
            var result = await _scheduleService.GetByPostAsync(postId, date);
            return Ok(result);
        }

        [HttpGet("available-slots")]
        public async Task<ActionResult<IEnumerable<AvailableSlotDto>>> GetAvailableSlots(
            [FromQuery] DateTime date,
            [FromQuery] int? postId)
        {
            var result = await _scheduleService.GetAvailableSlotsAsync(date, postId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<ScheduleDto>> Create([FromBody] CreateScheduleDto dto)
        {
            var result = await _scheduleService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateScheduleDto dto)
        {
            await _scheduleService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpPatch("{id:int}/link-order/{orderId:int}")]
        public async Task<IActionResult> LinkOrder(int id, int orderId)
        {
            await _scheduleService.LinkOrderAsync(id, orderId);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _scheduleService.DeleteAsync(id);
            return NoContent();
        }
    }
}
