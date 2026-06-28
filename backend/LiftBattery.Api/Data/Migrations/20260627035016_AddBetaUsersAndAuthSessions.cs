using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftBattery.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBetaUsersAndAuthSessions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DisplayName = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    TrainingGoal = table.Column<string>(type: "nvarchar(240)", maxLength: 240, nullable: true),
                    WeeklyTargetTrainingDays = table.Column<int>(type: "int", nullable: false),
                    PreferredUnit = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.CheckConstraint("CK_Users_PreferredUnit", "[PreferredUnit] IN ('kg', 'lb')");
                    table.CheckConstraint("CK_Users_WeeklyTargetTrainingDays", "[WeeklyTargetTrainingDays] >= 1 AND [WeeklyTargetTrainingDays] <= 14");
                });

            migrationBuilder.Sql(
                """
                DECLARE @Now datetimeoffset = SYSDATETIMEOFFSET();

                IF EXISTS (
                    SELECT 1
                    FROM (
                        SELECT [UserId] FROM [PreChecks]
                        UNION
                        SELECT [UserId] FROM [TrainingDays]
                    ) AS ExistingUsers
                    WHERE ExistingUsers.[UserId] > 0
                )
                BEGIN
                    SET IDENTITY_INSERT [Users] ON;

                    INSERT INTO [Users] (
                        [Id],
                        [DisplayName],
                        [Email],
                        [NormalizedEmail],
                        [PasswordHash],
                        [TrainingGoal],
                        [WeeklyTargetTrainingDays],
                        [PreferredUnit],
                        [CreatedAtUtc],
                        [UpdatedAtUtc])
                    SELECT
                        ExistingUsers.[UserId],
                        CONCAT('Imported user ', ExistingUsers.[UserId]),
                        CONCAT('imported+', ExistingUsers.[UserId], '@liftbattery.local'),
                        UPPER(CONCAT('imported+', ExistingUsers.[UserId], '@liftbattery.local')),
                        'imported-without-password-login-disabled',
                        'Imported from existing development data. Reassign or merge before public beta.',
                        4,
                        'kg',
                        @Now,
                        @Now
                    FROM (
                        SELECT [UserId] FROM [PreChecks]
                        UNION
                        SELECT [UserId] FROM [TrainingDays]
                    ) AS ExistingUsers
                    WHERE ExistingUsers.[UserId] > 0
                        AND NOT EXISTS (
                            SELECT 1
                            FROM [Users]
                            WHERE [Users].[Id] = ExistingUsers.[UserId]);

                    SET IDENTITY_INSERT [Users] OFF;
                END
                """);

            migrationBuilder.CreateTable(
                name: "AuthSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    TokenHash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: false),
                    ExpiresAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: false),
                    RevokedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(7)", precision: 7, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuthSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AuthSessions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuthSessions_UserId_ExpiresAtUtc",
                table: "AuthSessions",
                columns: new[] { "UserId", "ExpiresAtUtc" });

            migrationBuilder.CreateIndex(
                name: "UX_AuthSessions_TokenHash",
                table: "AuthSessions",
                column: "TokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UX_Users_NormalizedEmail",
                table: "Users",
                column: "NormalizedEmail",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PreChecks_Users_UserId",
                table: "PreChecks",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingDays_Users_UserId",
                table: "TrainingDays",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PreChecks_Users_UserId",
                table: "PreChecks");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainingDays_Users_UserId",
                table: "TrainingDays");

            migrationBuilder.DropTable(
                name: "AuthSessions");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
