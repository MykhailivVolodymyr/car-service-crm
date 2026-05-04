using AutoMapper;
using CarService.Application.DTOs.OrderPart.CreateOrderPart;
using CarService.Application.DTOs.OrderPart.GetOrderPart;
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
    public class OrderPartService : IOrderPartService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<OrderPartService> _logger;

        public OrderPartService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<OrderPartService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<OrderPartDto> AddPartToOrderAsync(AddOrderPartDto dto)
        {
            _logger.LogInformation("Adding part to Order #{OrderId}. PartId: {PartId}", dto.OrderId, dto.PartId);

            var order = await _unitOfWork.Orders.GetByIdAsync(dto.OrderId);
            if (order == null) throw new NotFoundException("Замовлення не знайдено.");

            string finalName = dto.PartName ?? "";
            decimal finalPrice = dto.Price ?? 0;

            // 1. Валідація та списання зі складу
            if (dto.PartId.HasValue)
            {
                var stockPart = await _unitOfWork.Parts.GetByIdAsync(dto.PartId.Value);
                if (stockPart == null) throw new NotFoundException("Запчастину не знайдено на складі.");

                if ((stockPart.Quantity ?? 0) < dto.Quantity)
                {
                    _logger.LogWarning("Insufficient stock for Part #{PartId}. Requested: {Req}, Available: {Avail}",
                        dto.PartId, dto.Quantity, stockPart.Quantity);
                    throw new BadRequestException($"Недостатньо товару на складі. В наявності: {stockPart.Quantity}");
                }

                finalName = stockPart.Name;
                finalPrice = dto.Price ?? stockPart.SellingPrice;

                // Списуємо зі складу
                stockPart.Quantity -= dto.Quantity;
                _unitOfWork.Parts.Update(stockPart);
            }

            // 2. Пошук дубліката в замовленні (якщо ціна та сама — об'єднуємо)
            var existingItem = await _unitOfWork.OrderParts.GetFirstOrDefaultAsync(op =>
                op.OrderId == dto.OrderId &&
                (dto.PartId.HasValue ? op.PartId == dto.PartId : op.PartName == finalName) &&
                op.Price == finalPrice);

            OrderPart entity;
            if (existingItem != null)
            {
                existingItem.Quantity += dto.Quantity;
                _unitOfWork.OrderParts.Update(existingItem);
                entity = existingItem;
            }
            else
            {
                entity = new OrderPart
                {
                    OrderId = dto.OrderId,
                    PartId = dto.PartId,
                    PartName = finalName,
                    Price = finalPrice,
                    Quantity = dto.Quantity
                };
                await _unitOfWork.OrderParts.AddAsync(entity);
            }

            // 3. Оновлення суми замовлення
            order.TotalAmount = (order.TotalAmount ?? 0) + (finalPrice * dto.Quantity);

            await _unitOfWork.CompleteAsync();
            _logger.LogInformation("Part '{Name}' processed. Stock and Order Total updated.", finalName);

            return _mapper.Map<OrderPartDto>(entity);
        }

        public async Task RemovePartFromOrderAsync(int orderPartId, decimal quantityToRemove = 1)
        {
            var item = await _unitOfWork.OrderParts.GetByIdAsync(orderPartId);
            if (item == null) throw new NotFoundException("Запис у замовленні не знайдено.");

            var order = await _unitOfWork.Orders.GetByIdAsync(item.OrderId);
            decimal actualToRemove = Math.Min(item.Quantity, quantityToRemove);

            // 1. Повернення на склад (якщо запчастина була прив'язана до каталогу)
            if (item.PartId.HasValue)
            {
                var stockPart = await _unitOfWork.Parts.GetByIdAsync(item.PartId.Value);
                if (stockPart != null)
                {
                    stockPart.Quantity = (stockPart.Quantity ?? 0) + actualToRemove;
                    _unitOfWork.Parts.Update(stockPart);
                }
            }

            if (order != null) order.TotalAmount -= (item.Price * actualToRemove);

            // 3. Коригування кількості в рядку
            if (item.Quantity <= actualToRemove)
                _unitOfWork.OrderParts.Delete(item);
            else
            {
                item.Quantity -= actualToRemove;
                _unitOfWork.OrderParts.Update(item);
            }

            await _unitOfWork.CompleteAsync();
            _logger.LogInformation("Removed {Qty} from order. Stock replenished.", actualToRemove);
        }

        public async Task DeletePartLineAsync(int orderPartId)
        {
            var item = await _unitOfWork.OrderParts.GetByIdAsync(orderPartId);
            if (item == null) return;

            // Викликаємо Remove, передаючи всю поточну кількість, щоб спрацювала логіка повернення на склад
            await RemovePartFromOrderAsync(orderPartId, item.Quantity);
        }

        public async Task<IEnumerable<OrderPartDto>> GetPartsByOrderIdAsync(int orderId)
        {
            var parts = await _unitOfWork.OrderParts.GetAsync(op => op.OrderId == orderId);
            return _mapper.Map<IEnumerable<OrderPartDto>>(parts);
        }
    }
}
