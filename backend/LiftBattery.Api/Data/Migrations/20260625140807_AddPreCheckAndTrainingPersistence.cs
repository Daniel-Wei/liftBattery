using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftBattery.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPreCheckAndTrainingPersistence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PreChecks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    PreCheckDate = table.Column<DateOnly>(type: "date", nullable: false),
                    SleepHours = table.Column<decimal>(type: "decimal(4,2)", precision: 4, scale: 2, nullable: false),
                    Soreness = table.Column<int>(type: "int", nullable: false),
                    Motivation = table.Column<int>(type: "int", nullable: false),
                    RestingHeartRateDelta = table.Column<int>(type: "int", nullable: false),
                    PreviousSessionRpe = table.Column<int>(type: "int", nullable: false),
                    PreviousSessionDurationMinutes = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PreChecks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TrainingDays",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingDays", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TrainingSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TrainingDayId = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    SessionRpe = table.Column<decimal>(type: "decimal(3,1)", precision: 3, scale: 1, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingSessions", x => x.Id);
                    table.CheckConstraint("CK_TrainingSessions_DurationMinutes", "[DurationMinutes] > 0");
                    table.CheckConstraint("CK_TrainingSessions_SessionRpe", "[SessionRpe] >= 0 AND [SessionRpe] <= 10");
                    table.ForeignKey(
                        name: "FK_TrainingSessions_TrainingDays_TrainingDayId",
                        column: x => x.TrainingDayId,
                        principalTable: "TrainingDays",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TrainingExercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TrainingSessionId = table.Column<int>(type: "int", nullable: false),
                    ExerciseOrder = table.Column<int>(type: "int", nullable: false),
                    MuscleGroup = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExerciseName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingExercises", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingExercises_TrainingSessions_TrainingSessionId",
                        column: x => x.TrainingSessionId,
                        principalTable: "TrainingSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TrainingSets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TrainingExerciseId = table.Column<int>(type: "int", nullable: false),
                    SetOrder = table.Column<int>(type: "int", nullable: false),
                    Reps = table.Column<int>(type: "int", nullable: false),
                    WeightKg = table.Column<decimal>(type: "decimal(7,2)", precision: 7, scale: 2, nullable: false),
                    IsWarmUp = table.Column<bool>(type: "bit", nullable: false),
                    Rpe = table.Column<decimal>(type: "decimal(3,1)", precision: 3, scale: 1, nullable: true),
                    Rir = table.Column<decimal>(type: "decimal(3,1)", precision: 3, scale: 1, nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingSets", x => x.Id);
                    table.CheckConstraint("CK_TrainingSets_Reps", "[Reps] >= 0");
                    table.CheckConstraint("CK_TrainingSets_Rir", "[Rir] IS NULL OR ([Rir] >= 0 AND [Rir] <= 10)");
                    table.CheckConstraint("CK_TrainingSets_Rpe", "[Rpe] IS NULL OR ([Rpe] >= 0 AND [Rpe] <= 10)");
                    table.CheckConstraint("CK_TrainingSets_SetOrder", "[SetOrder] > 0");
                    table.CheckConstraint("CK_TrainingSets_WeightKg", "[WeightKg] >= 0");
                    table.ForeignKey(
                        name: "FK_TrainingSets_TrainingExercises_TrainingExerciseId",
                        column: x => x.TrainingExerciseId,
                        principalTable: "TrainingExercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "UX_PreChecks_UserId_PreCheckDate",
                table: "PreChecks",
                columns: new[] { "UserId", "PreCheckDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UX_TrainingDays_UserId_Date",
                table: "TrainingDays",
                columns: new[] { "UserId", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UX_TrainingExercises_TrainingSessionId_ExerciseId",
                table: "TrainingExercises",
                columns: new[] { "TrainingSessionId", "ExerciseOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UX_TrainingSessions_TrainingDayId_StartTime",
                table: "TrainingSessions",
                columns: new[] { "TrainingDayId", "StartTime" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UX_TrainingSets_TrainingExerciseId_SetOrder",
                table: "TrainingSets",
                columns: new[] { "TrainingExerciseId", "SetOrder" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PreChecks");

            migrationBuilder.DropTable(
                name: "TrainingSets");

            migrationBuilder.DropTable(
                name: "TrainingExercises");

            migrationBuilder.DropTable(
                name: "TrainingSessions");

            migrationBuilder.DropTable(
                name: "TrainingDays");
        }
    }
}
