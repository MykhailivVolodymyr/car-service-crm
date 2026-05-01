using System;
using System.Collections.Generic;

namespace CarService.Infrastructure;

public partial class OrderPart
{
    public int Id { get; set; }

    public int OrderId { get; set; }

    public int? PartId { get; set; }

    public string PartName { get; set; } = null!;

    public decimal Price { get; set; }

    public decimal Quantity { get; set; }

    public virtual Order Order { get; set; } = null!;

    public virtual Part? Part { get; set; }
}
