using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.DTOs.Part.GetPart
{
    public record PartDto(
        int Id,
        string Name,
        string? Sku,
        decimal Quantity,
        decimal PurchasePrice,
        decimal SellingPrice,
        int CategoryId,
        string CategoryName,
        int ManufacturerId,
        string ManufacturerName
    );
}
