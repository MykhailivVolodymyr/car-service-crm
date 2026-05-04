using CarService.Application.DTOs.OrderService.CreateOrderService;
using CarService.Application.DTOs.OrderService.GetOrderService;
using CarService.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarService.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderServicesController : ControllerBase
    {
        private readonly IOrderServiceService _orderServiceService;

        public OrderServicesController(IOrderServiceService orderServiceService)
        {
            _orderServiceService = orderServiceService;
        }

        [HttpGet("order/{orderId:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<OrderServiceDto>>> GetByOrderId(int orderId)
        {
            var result = await _orderServiceService.GetServicesByOrderIdAsync(orderId);
            return Ok(result);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<OrderServiceDto>> AddService([FromBody] AddOrderServiceDto dto)
        {
            var result = await _orderServiceService.AddServiceToOrderAsync(dto);
            return Ok(result);
        }

        [HttpPatch("{id:int}/quantity")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SetQuantity(int id, [FromQuery] decimal quantity)
        {
            if (quantity <= 0)
            {
                return BadRequest("Кількість має бути більшою за нуль. Для видалення використовуйте DELETE.");
            }

            await _orderServiceService.UpdateQuantityAsync(id, quantity);
            return NoContent();
        }

        [HttpDelete("{id:int}/remove-quantity")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RemoveQuantity(int id, [FromQuery] decimal amount = 1)
        {
            await _orderServiceService.RemoveServiceFromOrderAsync(id, amount);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteLine(int id)
        {
            await _orderServiceService.DeleteServiceLineAsync(id);
            return NoContent();
        }
    }
}
