using CarService.Application.DTOs.Order.GetOrder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services
{
    public interface IPdfService
    {
        byte[] GenerateOrderInvoice(InvoiceDto data);
    }
}
