using AutoMapper;
using CarService.Application.DTOs.Order.CreateOrder;
using CarService.Application.DTOs.Order.GetOrder;
using CarService.Application.DTOs.Vehicle.CreateVehicle;
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
    public class OrderAppService : IOrderService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IVehicleService _vehicleService;
        private readonly ILogger<OrderAppService> _logger;
        private readonly INotificationService _notificationService;
        private readonly IPdfService _pdfService;

        public OrderAppService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IVehicleService vehicleService,
            ILogger<OrderAppService> logger,
            INotificationService notificationService,
            IPdfService pdfService
            )
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _vehicleService = vehicleService;
            _logger = logger;
            _notificationService = notificationService;
            _pdfService = pdfService;
        }

        public async Task<IEnumerable<OrderDto>> GetAllAsync()
        {
            _logger.LogInformation("Fetching all orders from the database.");
            var orders = await _unitOfWork.Orders.GetAllAsync();
            return _mapper.Map<IEnumerable<OrderDto>>(orders);
        }

        public async Task<OrderDto> GetByIdAsync(int id)
        {
            _logger.LogInformation("Fetching order with ID: {OrderId}", id);
            var order = await _unitOfWork.Orders.GetByIdAsync(id);

            if (order == null)
            {
                _logger.LogWarning("Order with ID {OrderId} was not found.", id);
                throw new NotFoundException($"Замовлення #{id} не знайдено.");
            }

            return _mapper.Map<OrderDto>(order);
        }

        public async Task<OrderDto> CreateAsync(CreateOrderDto dto)
        {
            _logger.LogInformation("Starting process to create a new order.");
            int vehicleId;

            if (dto.VehicleId.HasValue)
            {
                _logger.LogDebug("Validating existing VehicleId: {VehicleId}", dto.VehicleId);
                var vehicleExists = await _unitOfWork.Vehicles.AnyAsync(v => v.Id == dto.VehicleId.Value);

                if (!vehicleExists)
                {
                    _logger.LogError("Failed to create order: VehicleId {VehicleId} does not exist.", dto.VehicleId);
                    throw new NotFoundException($"Автомобіль з ID {dto.VehicleId} не знайдено в системі.");
                }

                vehicleId = dto.VehicleId.Value;
            }
            else
            {
                _logger.LogInformation("VehicleId not provided. Creating a new vehicle record for Plate: {Plate}", dto.LicensePlate);
                var newVehicle = await _vehicleService.CreateAsync(new CreateVehicleDto(
                    dto.ClientId, dto.ClientPhone, dto.ClientFullName, dto.ClientEmail,
                    dto.ModelId, dto.BrandName, dto.ModelName,
                    dto.Vin ?? "", dto.LicensePlate ?? "", dto.Year ?? DateTime.Now.Year
                ));
                vehicleId = newVehicle.Id;
                _logger.LogInformation("New vehicle created successfully with ID: {VehicleId}", vehicleId);
            }

            var order = new Order
            {
                VehicleId = vehicleId,
                StatusId = dto.StatusId,
                CreatedAt = DateTime.UtcNow,
                Mileage = dto.Mileage,
                Notes = dto.Notes,
                TotalAmount = 0
            };

            await _unitOfWork.Orders.AddAsync(order);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Order #{OrderId} created successfully for Vehicle {VehicleId}.", order.Id, vehicleId);

            var result = await _unitOfWork.Orders.GetByIdAsync(order.Id);
            return _mapper.Map<OrderDto>(result!);
        }

        public async Task UpdateStatusAsync(int id, int statusId)
        {
            _logger.LogInformation("Attempting to update status for Order #{OrderId} to StatusId {StatusId}", id, statusId);
            var order = await _unitOfWork.Orders.GetByIdAsync(id);

            if (order == null)
            {
                _logger.LogError("Update failed: Order #{OrderId} not found.", id);
                throw new NotFoundException($"Замовлення #{id} не знайдено.");
            }

            int oldStatusId = order.StatusId;
            order.StatusId = statusId;

            // Змінюємо на 5 (Закрито), щоб зафіксувати фінальну дату
            if (statusId == 5 || statusId == 4)
            {
                order.ClosedAt = DateTime.UtcNow;
                _logger.LogInformation("Order #{OrderId} marked as Closed. ClosedAt timestamp set.", id);

                if (statusId == 4 || statusId == 5) // Готово або Закрито
                {
                    order.ClosedAt = DateTime.UtcNow;

                    if (!string.IsNullOrWhiteSpace(order.Vehicle.Client?.Email))
                    {
                        try
                        {
                            var invoiceData = await GetInvoiceDataAsync(order.Id);

                            var pdfBytes = _pdfService.GenerateOrderInvoice(invoiceData);

                            string message = $@"
                                <h2>Ваше авто готове!</h2>
                                <p>Шановний {order.Vehicle.Client.FullName}, роботи по замовленню №{order.Id} завершені.</p>
                                <p>Автомобіль: <b>{order.Vehicle.Model.Brand.Name} {order.Vehicle.Model.Name} ({order.Vehicle.LicensePlate})</b></p>
                                <p>Детальний рахунок ви знайдете у вкладеному файлі.</p>
                                <p>Сума до сплати: <b>{order.TotalAmount:F2} грн.</b></p>";

                            await _notificationService.SendNotificationAsync(
                                order.Vehicle.Client.Email,
                                message,
                                $"Рахунок за замовлення #{order.Id} - CarService",
                                pdfBytes,
                                $"Invoice_{order.Id}.pdf"
                            );
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Помилка відправки листа з вкладенням");
                        }
                    }
                }
                else
                {
                    _logger.LogWarning("Customer email for Order #{OrderId} is missing. Notification skipped.", id);
                }
            }
            else if (oldStatusId == 5)
            {
                order.ClosedAt = null;
                _logger.LogInformation("Order #{OrderId} reopened. ClosedAt timestamp cleared.", id);
            }

            _unitOfWork.Orders.Update(order);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Order #{OrderId} status changed from {OldStatus} to {NewStatus}.", id, oldStatusId, statusId);
        }

        public async Task<IEnumerable<OrderDto>> GetByClientIdAsync(int clientId)
        {
            _logger.LogInformation("Fetching orders for Client ID: {ClientId}", clientId);
            var orders = await _unitOfWork.Orders.GetAsync(o => o.Vehicle.ClientId == clientId);
            return _mapper.Map<IEnumerable<OrderDto>>(orders);
        }

        public async Task<IEnumerable<OrderDto>> GetByVehicleIdAsync(int vehicleId)
        {
            _logger.LogInformation("Fetching orders for Vehicle ID: {VehicleId}", vehicleId);
            var orders = await _unitOfWork.Orders.GetAsync(o => o.VehicleId == vehicleId);
            return _mapper.Map<IEnumerable<OrderDto>>(orders);
        }

        public async Task<IEnumerable<OrderDto>> SearchActiveOrdersAsync(string searchTerm)
        {
            _logger.LogInformation("Searching for active orders with term: {SearchTerm}", searchTerm);

            // Приводимо термін до нижнього регістру для пошуку без врахування регістру
            var term = searchTerm.ToLower().Trim();

            // Шукаємо замовлення, де статус не 5 (Закрито)
            // І де номер авто, ім'я клієнта або телефон містять пошуковий термін
            var orders = await _unitOfWork.Orders.GetAsync(o =>
                o.StatusId != 5 && (
                    o.Vehicle.LicensePlate.ToLower().Contains(term) ||
                    o.Vehicle.Client!.FullName.ToLower().Contains(term) ||
                    o.Vehicle.Client!.Phone.Contains(term)
                ));

            return _mapper.Map<IEnumerable<OrderDto>>(orders);
        }

        public async Task UpdateAsync(int id, CreateOrderDto dto)
        {
            _logger.LogInformation("Updating Order #{OrderId} details.", id);
            var order = await _unitOfWork.Orders.GetByIdAsync(id);

            if (order == null)
            {
                _logger.LogError("Update failed: Order #{OrderId} not found.", id);
                throw new NotFoundException($"Замовлення #{id} не знайдено.");
            }

            order.Mileage = dto.Mileage;
            order.Notes = dto.Notes;
            order.StatusId = dto.StatusId;

            _unitOfWork.Orders.Update(order);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Order #{OrderId} updated successfully.", id);
        }

        public async Task DeleteAsync(int id)
        {
            _logger.LogWarning("Attempting to delete Order #{OrderId}", id);
            var order = await _unitOfWork.Orders.GetByIdAsync(id);

            if (order == null)
            {
                _logger.LogError("Delete failed: Order #{OrderId} not found.", id);
                throw new NotFoundException($"Замовлення #{id} не знайдено.");
            }

            _unitOfWork.Orders.Delete(order);
            await _unitOfWork.CompleteAsync();

            _logger.LogCritical("Order #{OrderId} was permanently deleted.", id);
        }

        public async Task<InvoiceDto> GetInvoiceDataAsync(int orderId)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(orderId);

            if (order == null) throw new NotFoundException("Замовлення не знайдено.");

            if (order.StatusId != 4 && order.StatusId != 5)
            {
                throw new BadRequestException("Рахунок можна згенерувати лише для замовлень у статусі 'Готово' або 'Закрито'.");
            }

            var vehicle = order.Vehicle;

            return new InvoiceDto(
                OrderId: order.Id,
                BrandName: vehicle.Model.Brand.Name,
                ModelName: vehicle.Model.Name,
                Vin: vehicle.Vin,
                LicensePlate: vehicle.LicensePlate,
                Mileage: order.Mileage,
                CreatedAt: order.CreatedAt ?? DateTime.Now,
                ClosedAt: order.ClosedAt,
                Services: order.OrderServices.Select((s, index) => new InvoiceItemDto(
                    index + 1, s.CustomName, s.Price, s.Quantity ?? 1, s.Price * (s.Quantity ?? 1))).ToList(),
                Parts: order.OrderParts.Select((p, index) => new InvoiceItemDto(
                    index + 1, p.PartName, p.Price, p.Quantity, p.Price * p.Quantity)).ToList(),
                TotalAmount: order.TotalAmount ?? 0
            );
        }
    }
}
