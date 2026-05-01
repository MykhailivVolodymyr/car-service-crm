using System;
using System.Collections.Generic;

namespace CarService.Infrastructure;

public partial class Part
{
    public int Id { get; set; }

    public int CategoryId { get; set; }

    public int ManufacturerId { get; set; }

    public string? Sku { get; set; }

    public string Name { get; set; } = null!;

    public decimal? Quantity { get; set; }

    public decimal PurchasePrice { get; set; }

    public decimal SellingPrice { get; set; }

    public virtual PartCategory Category { get; set; } = null!;

    public virtual Manufacturer Manufacturer { get; set; } = null!;

    public virtual ICollection<OrderPart> OrderParts { get; set; } = new List<OrderPart>();
}
