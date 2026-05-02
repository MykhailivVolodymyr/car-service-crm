using System;
using System.Collections.Generic;

namespace CarService.Infrastructure;

public partial class User
{
    public int Id { get; set; }

    public int RoleId { get; set; }

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public string? Phone { get; set; }

    public bool? IsActive { get; set; }

    public virtual Role Role { get; set; } = null!;

    public virtual ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
}
