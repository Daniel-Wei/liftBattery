using LiftBattery.Api.DTOs;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace LiftBattery.Api.Services;

public sealed class WeeklyReportPdfGenerator : IWeeklyReportPdfGenerator
{
    public byte[] GeneratePdf(TrendReportResultDto report, int dataVersion, string correlationId)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(36);
                page.Size(PageSizes.A4);
                page.DefaultTextStyle(text => text.FontSize(10).FontFamily("Microsoft YaHei"));
                page.Header().Column(column =>
                {
                    column.Item().Text("每周趋势报告").FontSize(20).Bold();
                    column.Item().Text($"周期：{report.StartWeek} 至 {DateOnly.Parse(report.EndWeek).AddDays(6):yyyy-MM-dd}");
                    column.Item().Text($"dataVersion：{dataVersion}    correlationId：{correlationId}").FontSize(8).FontColor(Colors.Grey.Darken1);
                });
                page.Content().PaddingTop(18).Column(column =>
                {
                    column.Spacing(14);
                    column.Item().Text("概要指标").FontSize(14).Bold();
                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(1.2f);
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn(1.6f);
                        });
                        table.Header(header =>
                        {
                            header.Cell().Element(HeaderCell).Text("指标");
                            header.Cell().Element(HeaderCell).Text("当前值");
                            header.Cell().Element(HeaderCell).Text("变化");
                            header.Cell().Element(HeaderCell).Text("周趋势数据");
                        });

                        foreach (var card in report.SummaryCards)
                        {
                            table.Cell().Element(BodyCell).Text(TranslateSummaryTitle(card.Title));
                            table.Cell().Element(BodyCell).Text($"{card.Value:0.#}{card.Unit}");
                            table.Cell().Element(BodyCell).Text(card.ChangePercent.HasValue ? $"{card.ChangePercent.Value:+0.#;-0.#;0}%" : "-");
                            table.Cell().Element(BodyCell).Text(string.Join(" / ", card.SparklineValues.Select(value => value.ToString("0.#"))));
                        }
                    });

                    if (report.MuscleStimulation is not null)
                    {
                        column.Item().Text("肌群刺激分布").FontSize(14).Bold();
                        column.Item().Text($"总刺激得分：{report.MuscleStimulation.TotalScore:0.#}，高刺激肌群：{report.MuscleStimulation.HighStimulusMuscleCount}，低刺激肌群：{report.MuscleStimulation.LowStimulusMuscleCount}");
                        column.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(1.4f);
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                            });
                            table.Header(header =>
                            {
                                header.Cell().Element(HeaderCell).Text("肌群");
                                header.Cell().Element(HeaderCell).Text("得分");
                                header.Cell().Element(HeaderCell).Text("占比");
                                header.Cell().Element(HeaderCell).Text("等级");
                            });

                            foreach (var muscle in report.MuscleStimulation.Muscles)
                            {
                                table.Cell().Element(BodyCell).Text(TranslateMuscleGroup(muscle.Muscle));
                                table.Cell().Element(BodyCell).Text($"{muscle.Score:0.#}");
                                table.Cell().Element(BodyCell).Text($"{muscle.Percentage:0.#}%");
                                table.Cell().Element(BodyCell).Text(TranslateStimulusLevel(muscle.Level));
                            }
                        });
                    }
                });
                page.Footer().AlignRight().DefaultTextStyle(text => text.FontSize(8).FontColor(Colors.Grey.Darken1)).Text(text =>
                {
                    text.Span("LiftOps ");
                    text.CurrentPageNumber();
                    text.Span(" / ");
                    text.TotalPages();
                });
            });
        }).GeneratePdf();
    }

    private static IContainer HeaderCell(IContainer container)
    {
        return container.Background(Colors.Grey.Lighten3).Padding(6).DefaultTextStyle(text => text.Bold());
    }

    private static IContainer BodyCell(IContainer container)
    {
        return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6);
    }

    private static string TranslateSummaryTitle(string title)
    {
        return title switch
        {
            "Readiness" => "恢复状态",
            "Sleep" => "睡眠",
            "Training Load" => "训练负荷",
            "Training Volume" => "训练容量",
            _ => title,
        };
    }

    private static string TranslateMuscleGroup(string muscle)
    {
        return muscle switch
        {
            "Chest" => "胸部",
            "Back" => "背部",
            "Shoulders" => "肩部",
            "Biceps" => "肱二头肌",
            "Triceps" => "肱三头肌",
            "Quads" => "股四头肌",
            "Hamstrings" => "腘绳肌",
            "Glutes" => "臀部",
            "Calves" => "小腿",
            "Abs" => "腹部",
            _ => muscle,
        };
    }

    private static string TranslateStimulusLevel(string level)
    {
        return level switch
        {
            "high" => "高",
            "medium" => "中",
            "low" => "低",
            "none" => "无",
            _ => level,
        };
    }
}
