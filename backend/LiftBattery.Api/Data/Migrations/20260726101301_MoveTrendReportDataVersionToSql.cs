using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftBattery.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class MoveTrendReportDataVersionToSql : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // CaptureSnapshotAsync uses transaction-level SQL Server snapshot isolation
            // so DataVersion, Training, and PreCheck share one consistent read boundary.
            migrationBuilder.Sql(
                "ALTER DATABASE CURRENT SET ALLOW_SNAPSHOT_ISOLATION ON;",
                suppressTransaction: true);
            migrationBuilder.AddColumn<string>(
                name: "TrendReportDataVersion",
                table: "Users",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TrendReportDataVersion",
                table: "Users");
        }
    }
}
