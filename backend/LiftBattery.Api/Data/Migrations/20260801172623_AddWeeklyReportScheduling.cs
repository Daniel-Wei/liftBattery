using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftBattery.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddWeeklyReportScheduling : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WeeklyReportSchedule",
                columns: table => new
                {
                    ScheduleId = table.Column<string>(type: "nvarchar(96)", maxLength: 96, nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RecipientEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    TimeZoneId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    LocalSendTime = table.Column<TimeOnly>(type: "time(0)", nullable: false),
                    Enabled = table.Column<bool>(type: "bit", nullable: false),
                    NextRunAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: true),
                    LastRunAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: true),
                    LastPeriodKey = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    LeaseUntilUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: true),
                    ClaimedBy = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    ClaimedPeriodKey = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WeeklyReportSchedule", x => x.ScheduleId);
                    table.ForeignKey(
                        name: "FK_WeeklyReportSchedule_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WeeklyReportDelivery",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ScheduleId = table.Column<string>(type: "nvarchar(96)", maxLength: 96, nullable: false),
                    PeriodKey = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ReportingPeriodStart = table.Column<DateOnly>(type: "date", nullable: false),
                    ReportingPeriodEnd = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(24)", maxLength: 24, nullable: false),
                    RecipientEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    SourceDataVersion = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    DataSampledAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: true),
                    GeneratedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: true),
                    BlobPath = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    SentAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: true),
                    ProcessingClaimId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    ProcessingLeaseUntilUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: true),
                    LastError = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WeeklyReportDelivery", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WeeklyReportDelivery_WeeklyReportSchedule_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "WeeklyReportSchedule",
                        principalColumn: "ScheduleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "UX_WeeklyReportDelivery_ScheduleId_PeriodKey",
                table: "WeeklyReportDelivery",
                columns: new[] { "ScheduleId", "PeriodKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WeeklyReportSchedule_Due",
                table: "WeeklyReportSchedule",
                column: "NextRunAtUtc",
                filter: "[Enabled] = 1")
                .Annotation("SqlServer:Include", new[] { "ScheduleId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "UX_WeeklyReportSchedule_UserId",
                table: "WeeklyReportSchedule",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WeeklyReportDelivery");

            migrationBuilder.DropTable(
                name: "WeeklyReportSchedule");
        }
    }
}
