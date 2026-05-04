using CarService.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Domain.Abstractions
{
    public interface IOrderPartRepository: IRepository<OrderPart>
    {
    }
}
