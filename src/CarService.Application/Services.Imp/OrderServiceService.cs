using AutoMapper;
using CarService.Application.DTOs.OrderService.CreateOrderService;
using CarService.Application.DTOs.OrderService.GetOrderService;
using CarService.Application.Exceptions;
using CarService.Domain.Abstractions;
using CarService.Infrastructure;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services.Imp
{
    public class OrderServiceService : IOrderServiceService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<OrderServiceService> _logger;

        public OrderServiceService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<OrderServiceService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<OrderServiceDto> AddServiceToOrderAsync(AddOrderServiceDto dto)
        {
            _logger.LogInformation("Attempting to add service to Order #{OrderId}.", dto.OrderId);

            var order = await _unitOfWork.Orders.GetByIdAsync(dto.OrderId);
            if (order == null)
            {
                _logger.LogError("Order #{OrderId} not found.", dto.OrderId);
                throw new NotFoundException("Замовлення не знайдено.");
            }

            string finalName = dto.CustomName ?? "";
            decimal finalPrice = dto.Price ?? 0;

            if (dto.ServiceId.HasValue)
            {
                _logger.LogDebug("Fetching service details for ServiceID: {ServiceId}", dto.ServiceId);
                var serviceBase = await _unitOfWork.Services.GetByIdAsync(dto.ServiceId.Value);
                if (serviceBase == null)
                {
                    _logger.LogWarning("Service with ID {ServiceId} not found in catalog.", dto.ServiceId);
                    throw new NotFoundException("Послугу в прайсі не знайдено.");
                }

                finalName = serviceBase.Name;
                finalPrice = dto.Price ?? serviceBase.DefaultPrice;
            }

            _logger.LogDebug("Checking for existing service line in Order #{OrderId} with Name: {Name} and Price: {Price}",
                dto.OrderId, finalName, finalPrice);

            var existingItem = await _unitOfWork.OrderServices.GetFirstOrDefaultAsync(os =>
                os.OrderId == dto.OrderId &&
                (dto.ServiceId.HasValue ? os.ServiceId == dto.ServiceId : os.CustomName == finalName) &&
                os.Price == finalPrice);

            OrderService entity;
            if (existingItem != null)
            {
                _logger.LogInformation("Existing service found. Increasing quantity by {QuantityToAdd} for OrderService #{OrderServiceId}",
                    dto.Quantity, existingItem.Id);

                existingItem.Quantity = (existingItem.Quantity ?? 0) + dto.Quantity;
                _unitOfWork.OrderServices.Update(existingItem);
                entity = existingItem;
            }
            else
            {
                _logger.LogInformation("No existing service found. Creating new service line: {Name}", finalName);
                entity = new OrderService
                {
                    OrderId = dto.OrderId,
                    ServiceId = dto.ServiceId,
                    CustomName = finalName,
                    Price = finalPrice,
                    Quantity = dto.Quantity
                };
                await _unitOfWork.OrderServices.AddAsync(entity);
            }

            decimal additionalAmount = finalPrice * dto.Quantity;
            order.TotalAmount = (order.TotalAmount ?? 0) + additionalAmount;

            await _unitOfWork.CompleteAsync();
            _logger.LogInformation("Order #{OrderId} updated. Total amount increased by {Amount}.", dto.OrderId, additionalAmount);

            return _mapper.Map<OrderServiceDto>(entity);
        }

        public async Task RemoveServiceFromOrderAsync(int orderServiceId, decimal quantityToRemove = 1)
        {
            _logger.LogInformation("Removing {Quantity} units from OrderService #{OrderServiceId}.", quantityToRemove, orderServiceId);

            var item = await _unitOfWork.OrderServices.GetByIdAsync(orderServiceId);
            if (item == null)
            {
                _logger.LogWarning("OrderService #{OrderServiceId} not found.", orderServiceId);
                throw new NotFoundException("Послугу в замовленні не знайдено.");
            }

            var order = await _unitOfWork.Orders.GetByIdAsync(item.OrderId);
            decimal actualToRemove = Math.Min(item.Quantity ?? 0, quantityToRemove);

            if (order != null)
            {
                decimal amountToDeduct = item.Price * actualToRemove;
                order.TotalAmount -= amountToDeduct;
                _logger.LogDebug("Deducting {Amount} from Order #{OrderId} total amount.", amountToDeduct, order.Id);
            }

            if ((item.Quantity ?? 0) <= actualToRemove)
            {
                _logger.LogInformation("Quantity reached zero. Deleting OrderService line #{OrderServiceId}.", orderServiceId);
                _unitOfWork.OrderServices.Delete(item);
            }
            else
            {
                item.Quantity -= actualToRemove;
                _unitOfWork.OrderServices.Update(item);
                _logger.LogInformation("OrderService #{OrderServiceId} quantity decreased to {NewQuantity}.", orderServiceId, item.Quantity);
            }

            await _unitOfWork.CompleteAsync();
        }

        public async Task UpdateQuantityAsync(int orderServiceId, decimal newQuantity)
        {
            _logger.LogInformation("Updating OrderService #{OrderServiceId} quantity to {NewQuantity}.", orderServiceId, newQuantity);

            var item = await _unitOfWork.OrderServices.GetByIdAsync(orderServiceId);
            if (item == null)
            {
                _logger.LogError("Update failed: OrderService #{OrderServiceId} not found.", orderServiceId);
                throw new NotFoundException("Запис не знайдено.");
            }

            var order = await _unitOfWork.Orders.GetByIdAsync(item.OrderId);
            if (order != null)
            {
                decimal oldLineTotal = item.Price * (item.Quantity ?? 0);
                decimal newLineTotal = item.Price * newQuantity;

                order.TotalAmount = (order.TotalAmount ?? 0) - oldLineTotal + newLineTotal;
                _logger.LogDebug("Recalculated Order #{OrderId} total: {OldTotal} -> {NewTotal}",
                    order.Id, order.TotalAmount + oldLineTotal - newLineTotal, order.TotalAmount);
            }

            item.Quantity = newQuantity;
            _unitOfWork.OrderServices.Update(item);
            await _unitOfWork.CompleteAsync();
        }

        public async Task DeleteServiceLineAsync(int orderServiceId)
        {
            _logger.LogWarning("Deleting entire service line #{OrderServiceId}.", orderServiceId);

            var item = await _unitOfWork.OrderServices.GetByIdAsync(orderServiceId);
            if (item == null)
            {
                _logger.LogDebug("Service line #{OrderServiceId} already gone or not found.", orderServiceId);
                return;
            }

            var order = await _unitOfWork.Orders.GetByIdAsync(item.OrderId);
            if (order != null)
            {
                decimal amountToDeduct = item.Price * (item.Quantity ?? 0);
                order.TotalAmount -= amountToDeduct;
                _logger.LogInformation("Removed {Amount} from Order #{OrderId} total amount due to line deletion.", amountToDeduct, order.Id);
            }

            _unitOfWork.OrderServices.Delete(item);
            await _unitOfWork.CompleteAsync();
        }

        public async Task<IEnumerable<OrderServiceDto>> GetServicesByOrderIdAsync(int orderId)
        {
            _logger.LogInformation("Fetching all services for Order #{OrderId}.", orderId);
            var services = await _unitOfWork.OrderServices.GetAsync(os => os.OrderId == orderId);
            return _mapper.Map<IEnumerable<OrderServiceDto>>(services);
        }
    }
}

