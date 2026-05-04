using CarService.Application.DTOs.OrderPart.CreateOrderPart;
using CarService.Application.DTOs.OrderPart.GetOrderPart;
using CarService.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarService.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderPartsController : ControllerBase
    {
        private readonly IOrderPartService _orderPartService;

        public OrderPartsController(IOrderPartService orderPartService)
        {
            _orderPartService = orderPartService;
        }

        [HttpGet("order/{orderId:int}")]
        public async Task<ActionResult<IEnumerable<OrderPartDto>>> GetByOrderId(int orderId)
        {
            var result = await _orderPartService.GetPartsByOrderIdAsync(orderId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<OrderPartDto>> Add([FromBody] AddOrderPartDto dto)
        {
            var result = await _orderPartService.AddPartToOrderAsync(dto);
            return Ok(result);
        }

        [HttpDelete("{id:int}/remove-quantity")]
        public async Task<IActionResult> RemoveQuantity(int id, [FromQuery] decimal amount = 1)
        {
            await _orderPartService.RemovePartFromOrderAsync(id, amount);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteLine(int id)
        {
            await _orderPartService.DeletePartLineAsync(id);
            return NoContent();
        }
    }
}
