using System;
using System.Collections.Generic;

namespace CarService.Infrastructure;

public partial class VehicleBrand
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<VehicleModel> VehicleModels { get; set; } = new List<VehicleModel>();
}
