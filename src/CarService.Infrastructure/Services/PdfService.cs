using CarService.Application.DTOs.Order.GetOrder;
using CarService.Application.Services;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using QuestPDF.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CarService.Infrastructure.Services
{
    public class PdfService : IPdfService
    {
        public byte[] GenerateOrderInvoice(InvoiceDto data)
        {
            // QuestPDF Community License setup
            QuestPDF.Settings.License = LicenseType.Community;

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(30);
                    page.Size(PageSizes.A4);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                    // 1. ШАПКА (Дані про авто та замовлення)
                    page.Header().Border(1).Table(table =>
                    {
                        table.ColumnsDefinition(cols => {
                            cols.RelativeColumn(); cols.RelativeColumn();
                        });

                        table.Cell().BorderBottom(1).Padding(5).Text(t => {
                            t.Span("Марка авто: ").Bold();
                            t.Span(data.BrandName);
                        });

                        table.Cell().BorderBottom(1).BorderLeft(1).Padding(5).Text(t => {
                            t.Span("Пробіг: ").Bold();
                            t.Span($"{data.Mileage} км");
                        });

                        table.Cell().BorderBottom(1).Padding(5).Text(t => {
                            t.Span("Модель авто: ").Bold();
                            t.Span(data.ModelName);
                        });

                        table.Cell().BorderBottom(1).BorderLeft(1).Padding(5).Text(t => {
                            t.Span("Дата прийому: ").Bold();
                            t.Span(data.CreatedAt.ToString("dd.MM.yyyy"));
                        });

                        table.Cell().BorderBottom(1).Padding(5).Text(t => {
                            t.Span("VIN код: ").Bold();
                            t.Span(data.Vin);
                        });

                        table.Cell().BorderBottom(1).BorderLeft(1).Padding(5).Text(t => {
                            t.Span("Термін закінчення: ").Bold();
                            t.Span(data.ClosedAt?.ToString("dd.MM.yyyy") ?? "-");
                        });

                        table.Cell().Padding(5).Text(t => {
                            t.Span("Держ. номер: ").Bold();
                            t.Span(data.LicensePlate);
                        });
                    });

                    // 2. КОНТЕНТ (Таблиці робіт та запчастин)
                    // Збільшено PaddingTop з 10 до 25 для більшого відступу від шапки
                    page.Content().PaddingTop(25).Column(col =>
                    {
                        // Секція робіт
                        col.Item().Text("Список робіт:").Bold();
                        col.Item().PaddingTop(5).Table(t => BuildInvoiceTable(t, data.Services, "Найменування роботи"));

                        // Секція запчастин
                        col.Item().PaddingTop(20).Text("Список запчастин:").Bold();
                        col.Item().PaddingTop(5).Table(t => BuildInvoiceTable(t, data.Parts, "Встановлені запчастини"));

                        // ЗАГАЛЬНИЙ ПІДСУМОК
                        col.Item().AlignRight().PaddingTop(30).Column(c => {
                            c.Item().Text($"Разом: {data.TotalAmount:F2} грн").FontSize(14).Bold();
                            c.Item().Text("До сплати:").FontSize(12);
                            c.Item().Text($"{data.TotalAmount:F2} грн").FontSize(16).FontColor(Colors.Green.Medium).Bold();
                        });
                    });
                });
            }).GeneratePdf();
        }

        private void BuildInvoiceTable(TableDescriptor table, List<InvoiceItemDto> items, string nameColumnHeader)
        {
            table.ColumnsDefinition(columns => {
                columns.ConstantColumn(25);  // №
                columns.RelativeColumn();    // Найменування
                columns.ConstantColumn(70);  // Ціна
                columns.ConstantColumn(40);  // Кіл-ть
                columns.ConstantColumn(80);  // Сума
            });

            // ШАПКА ТАБЛИЦІ (Суцільна заливка кольором)
            table.Header(header => {
                header.Cell().ColumnSpan(5).Background(Colors.Yellow.Lighten5).Border(0.5f).Table(headerTable =>
                {
                    headerTable.ColumnsDefinition(columns => {
                        columns.ConstantColumn(25);
                        columns.RelativeColumn();
                        columns.ConstantColumn(70);
                        columns.ConstantColumn(40);
                        columns.ConstantColumn(80);
                    });

                    headerTable.Cell().Element(HeaderCellStyle).Text("№").Bold();
                    headerTable.Cell().Element(HeaderCellStyle).Text(nameColumnHeader).Bold();
                    headerTable.Cell().Element(HeaderTextStyle).Text("Ціна").Bold();
                    headerTable.Cell().Element(HeaderTextStyle).Text("Кіл-ть").Bold();
                    headerTable.Cell().Element(HeaderTextStyle).Text("Сума, грн").Bold();
                });
            });

            // РЯДКИ З ДАНИМИ
            foreach (var item in items)
            {
                table.Cell().Element(CellStyle).AlignCenter().Text(item.Number.ToString());
                table.Cell().Element(CellStyle).AlignLeft().PaddingLeft(4).Text(item.Name);
                table.Cell().Element(CellStyle).AlignRight().PaddingRight(4).Text($"{item.Price:F2}");
                table.Cell().Element(CellStyle).AlignCenter().Text($"{(int)item.Quantity}");
                table.Cell().Element(CellStyle).AlignRight().PaddingRight(4).Text($"{item.Total:F2}");
            }

            // ПІДСУМОК СЕКЦІЇ
            var sectionTotal = items.Sum(x => x.Total);

            table.Footer(footer => {
                footer.Cell().ColumnSpan(3).Element(FooterLabelStyle).AlignRight().PaddingRight(4).Text("Разом:").Bold();
                footer.Cell().ColumnSpan(2).Element(CellStyle).AlignRight().PaddingRight(4).Text($"{sectionTotal:F2}").Bold();
            });
        }

        // Базовий стиль для комірок шапки
        static IContainer HeaderCellStyle(IContainer container) =>
            container.Padding(2).AlignCenter().AlignMiddle();

        // Стиль для внутрішніх ліній шапки (щоб не дублювати зовнішню рамку)
        static IContainer HeaderTextStyle(IContainer container) =>
            container.BorderLeft(0.5f).Padding(2).AlignCenter().AlignMiddle();

        static IContainer CellStyle(IContainer container) =>
            container.Border(0.5f).Padding(2).AlignMiddle();

        static IContainer FooterLabelStyle(IContainer container) =>
            container.AlignMiddle();
    }
}