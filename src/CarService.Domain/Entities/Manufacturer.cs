using System;
using System.Collections.Generic;

namespace CarService.Infrastructure;

public partial class Manufacturer
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Part> Parts { get; set; } = new List<Part>();
}
