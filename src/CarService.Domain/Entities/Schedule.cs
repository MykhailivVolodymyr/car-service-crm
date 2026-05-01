using System;
using System.Collections.Generic;

namespace CarService.Infrastructure;

public partial class Schedule
{
    public int Id { get; set; }

    public int? OrderId { get; set; }

    public int PostId { get; set; }

    public int MechanicId { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public string? Description { get; set; }

    public virtual User Mechanic { get; set; } = null!;

    public virtual Order? Order { get; set; }

    public virtual WorkPost Post { get; set; } = null!;
}
