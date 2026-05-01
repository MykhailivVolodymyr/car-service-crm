using System;
using System.Collections.Generic;

namespace CarService.Infrastructure;

public partial class Vehicle
{
    public int Id { get; set; }

    public int? ClientId { get; set; }

    public int ModelId { get; set; }

    public string Vin { get; set; } = null!;

    public string LicensePlate { get; set; } = null!;

    public int Year { get; set; }

    public virtual Client? Client { get; set; }

    public virtual VehicleModel Model { get; set; } = null!;

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
