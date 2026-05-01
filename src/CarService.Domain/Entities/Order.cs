using System;
using System.Collections.Generic;

namespace CarService.Infrastructure;

public partial class Order
{
    public int Id { get; set; }

    public int VehicleId { get; set; }

    public int StatusId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? ClosedAt { get; set; }

    public int? Mileage { get; set; }

    public decimal? TotalAmount { get; set; }

    public string? Notes { get; set; }

    public virtual ICollection<OrderPart> OrderParts { get; set; } = new List<OrderPart>();

    public virtual ICollection<OrderService> OrderServices { get; set; } = new List<OrderService>();

    public virtual ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();

    public virtual Status Status { get; set; } = null!;

    public virtual Vehicle Vehicle { get; set; } = null!;
}
