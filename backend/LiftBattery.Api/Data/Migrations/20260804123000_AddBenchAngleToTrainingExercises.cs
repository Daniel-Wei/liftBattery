using LiftBattery.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftBattery.Api.Data.Migrations;

[DbContext(typeof(LiftBatteryDbContext))]
[Migration("20260804123000_AddBenchAngleToTrainingExercises")]
public sealed class AddBenchAngleToTrainingExercises : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "BenchAngleDegrees",
            table: "TrainingExercises",
            type: "int",
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "BenchAngleDegrees",
            table: "TrainingExercises");
    }
}
