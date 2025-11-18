using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantManagment.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class Rep : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminNote",
                table: "Reviews",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsReported",
                table: "Reviews",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ReportReason",
                table: "Reviews",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReportedAt",
                table: "Reviews",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReportedByOwnerId",
                table: "Reviews",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminNote",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "IsReported",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "ReportReason",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "ReportedAt",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "ReportedByOwnerId",
                table: "Reviews");
        }
    }
}
