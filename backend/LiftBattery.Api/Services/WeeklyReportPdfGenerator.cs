using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace LiftBattery.Api.Services;

public sealed class WeeklyReportPdfGenerator : IWeeklyReportPdfGenerator
{
    public byte[] GeneratePdf(TrendReportResultDto report, WeeklyReportPdfMetadata metadata)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        return Document.Create(document =>
        {
            document.Page(page =>
            {
                page.Margin(36);
                page.Size(PageSizes.A4);
                page.DefaultTextStyle(text => text.FontSize(10));
                page.Header().Column(column =>
                {
                    column.Item().Text("Weekly trend report").FontSize(20).Bold();
                    column.Item().Text(
                        $"Reporting period: {metadata.ReportingPeriod.Start:yyyy-MM-dd} to {metadata.ReportingPeriod.End:yyyy-MM-dd}");
                    column.Item().Text($"Data sampled at: {metadata.DataSampledAtUtc:O}");
                    column.Item().Text($"Generated at: {metadata.GeneratedAtUtc:O}");
                });

                page.Content().PaddingTop(18).Column(column =>
                {
                    column.Spacing(14);
                    column.Item().Text("Summary").FontSize(14).Bold();
                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(1.4f);
                            columns.RelativeColumn();
                            columns.RelativeColumn(1.8f);
                        });
                        table.Header(header =>
                        {
                            header.Cell().Element(HeaderCell).Text("Metric");
                            header.Cell().Element(HeaderCell).Text("Value");
                            header.Cell().Element(HeaderCell).Text("Sample");
                        });

                        foreach (var card in report.SummaryCards)
                        {
                            table.Cell().Element(BodyCell).Text(card.Title);
                            table.Cell().Element(BodyCell).Text($"{card.Value:0.#}{card.Unit}");
                            table.Cell().Element(BodyCell).Text(
                                string.Join(" / ", card.SparklineValues.Select(value => value.ToString("0.#"))));
                        }
                    });
                });

                page.Footer().AlignRight().Text(text =>
                {
                    text.Span("LiftOps  ");
                    text.CurrentPageNumber();
                    text.Span(" / ");
                    text.TotalPages();
                });
            });
        }).GeneratePdf();
    }

    private static IContainer HeaderCell(IContainer container) =>
        container.Background(Colors.Grey.Lighten3).Padding(6).DefaultTextStyle(text => text.Bold());

    private static IContainer BodyCell(IContainer container) =>
        container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6);
}
