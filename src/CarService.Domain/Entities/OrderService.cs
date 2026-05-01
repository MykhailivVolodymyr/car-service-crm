using System;
using System.Collections.Generic;

namespace CarService.Infrastructure;

public partial class OrderService
{
    public int Id { get; set; }

    public int OrderId { get; set; }

    public int? ServiceId { get; set; }

    public string CustomName { get; set; } = null!;

    public decimal Price { get; set; }

    public decimal? Quantity { get; set; }

    public virtual Order Order { get; set; } = null!;

    public virtual Service? Service { get; set; }
}
