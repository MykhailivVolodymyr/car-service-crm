using System;
using System.Collections.Generic;

namespace CarService.Infrastructure;

public partial class Service
{
    public int Id { get; set; }

    public int CategoryId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public decimal DefaultPrice { get; set; }

    public virtual ServiceCategory Category { get; set; } = null!;

    public virtual ICollection<OrderService> OrderServices { get; set; } = new List<OrderService>();
}
