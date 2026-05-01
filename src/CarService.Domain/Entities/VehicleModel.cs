using System;
using System.Collections.Generic;

namespace CarService.Infrastructure;

public partial class VehicleModel
{
    public int Id { get; set; }

    public int BrandId { get; set; }

    public string Name { get; set; } = null!;

    public virtual VehicleBrand Brand { get; set; } = null!;

    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
