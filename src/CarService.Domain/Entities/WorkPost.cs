using System;
using System.Collections.Generic;

namespace CarService.Infrastructure;

public partial class WorkPost
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public bool? IsActive { get; set; }

    public virtual ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
}
