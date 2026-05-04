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
            var order = await _unitOfWork.Orders.GetByIdAsync(dto.OrderId);
            if (order == null) throw new NotFoundException("Замовлення не знайдено.");

            string finalName = dto.CustomName ?? "";
            decimal finalPrice = dto.Price ?? 0;

            if (dto.ServiceId.HasValue)
            {
                var serviceBase = await _unitOfWork.Services.GetByIdAsync(dto.ServiceId.Value);
                if (serviceBase == null) throw new NotFoundException("Послугу в прайсі не знайдено.");
                finalName = serviceBase.Name;
                finalPrice = dto.Price ?? serviceBase.DefaultPrice;
            }

            // Шукаємо дублікат за ID послуги АБО за назвою + ціною
            var existingItem = await _unitOfWork.OrderServices.GetFirstOrDefaultAsync(os =>
                os.OrderId == dto.OrderId &&
                (dto.ServiceId.HasValue ? os.ServiceId == dto.ServiceId : os.CustomName == finalName) &&
                os.Price == finalPrice);

            OrderService entity;
            if (existingItem != null)
            {
                existingItem.Quantity = (existingItem.Quantity ?? 0) + dto.Quantity;
                _unitOfWork.OrderServices.Update(existingItem);
                entity = existingItem;
            }
            else
            {
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

            order.TotalAmount = (order.TotalAmount ?? 0) + (finalPrice * dto.Quantity);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<OrderServiceDto>(entity);
        }

        public async Task RemoveServiceFromOrderAsync(int orderServiceId, decimal quantityToRemove = 1)
        {
            var item = await _unitOfWork.OrderServices.GetByIdAsync(orderServiceId);
            if (item == null) throw new NotFoundException("Послугу в замовленні не знайдено.");

            var order = await _unitOfWork.Orders.GetByIdAsync(item.OrderId);
            decimal actualToRemove = Math.Min(item.Quantity ?? 0, quantityToRemove);

            if (order != null) order.TotalAmount -= (item.Price * actualToRemove);

            if ((item.Quantity ?? 0) <= actualToRemove)
                _unitOfWork.OrderServices.Delete(item);
            else
            {
                item.Quantity -= actualToRemove;
                _unitOfWork.OrderServices.Update(item);
            }

            await _unitOfWork.CompleteAsync();
        }

        public async Task UpdateQuantityAsync(int orderServiceId, decimal newQuantity)
        {
            var item = await _unitOfWork.OrderServices.GetByIdAsync(orderServiceId);
            if (item == null) throw new NotFoundException("Запис не знайдено.");

            var order = await _unitOfWork.Orders.GetByIdAsync(item.OrderId);
            if (order != null)
            {
                // Перерахунок суми: віднімаємо стару вартість рядка і додаємо нову
                order.TotalAmount -= (item.Price * (item.Quantity ?? 0));
                order.TotalAmount += (item.Price * newQuantity);
            }

            item.Quantity = newQuantity;
            _unitOfWork.OrderServices.Update(item);
            await _unitOfWork.CompleteAsync();
        }

        public async Task DeleteServiceLineAsync(int orderServiceId)
        {
            var item = await _unitOfWork.OrderServices.GetByIdAsync(orderServiceId);
            if (item == null) return;

            var order = await _unitOfWork.Orders.GetByIdAsync(item.OrderId);
            if (order != null) order.TotalAmount -= (item.Price * (item.Quantity ?? 0));

            _unitOfWork.OrderServices.Delete(item);
            await _unitOfWork.CompleteAsync();
        }

        public async Task<IEnumerable<OrderServiceDto>> GetServicesByOrderIdAsync(int orderId)
        {
            var services = await _unitOfWork.OrderServices.GetAsync(os => os.OrderId == orderId);
            return _mapper.Map<IEnumerable<OrderServiceDto>>(services);
        }
    }
}
