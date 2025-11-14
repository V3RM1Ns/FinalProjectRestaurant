using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantManagment.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class AddLoyaltyCodeTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoyaltyPoints_AspNetUsers_CustomerId",
                table: "LoyaltyPoints");

            migrationBuilder.DropForeignKey(
                name: "FK_LoyaltyPoints_Orders_OrderId",
                table: "LoyaltyPoints");

            migrationBuilder.DropForeignKey(
                name: "FK_LoyaltyPoints_Restaurants_RestaurantId",
                table: "LoyaltyPoints");

            migrationBuilder.CreateTable(
                name: "LoyaltyCodes",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PointValue = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedByAdminId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    MaxUses = table.Column<int>(type: "int", nullable: true),
                    CurrentUses = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    UsedByCustomerId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    UsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RestaurantId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoyaltyCodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoyaltyCodes_AspNetUsers_CreatedByAdminId",
                        column: x => x.CreatedByAdminId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LoyaltyCodes_AspNetUsers_UsedByCustomerId",
                        column: x => x.UsedByCustomerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_LoyaltyCodes_Restaurants_RestaurantId",
                        column: x => x.RestaurantId,
                        principalTable: "Restaurants",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyPoints_CustomerId_RestaurantId",
                table: "LoyaltyPoints",
                columns: new[] { "CustomerId", "RestaurantId" });

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyCodes_CreatedByAdminId",
                table: "LoyaltyCodes",
                column: "CreatedByAdminId");

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyCodes_RestaurantId",
                table: "LoyaltyCodes",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyCodes_UsedByCustomerId",
                table: "LoyaltyCodes",
                column: "UsedByCustomerId");

            migrationBuilder.AddForeignKey(
                name: "FK_LoyaltyPoints_AspNetUsers_CustomerId",
                table: "LoyaltyPoints",
                column: "CustomerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LoyaltyPoints_Orders_OrderId",
                table: "LoyaltyPoints",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_LoyaltyPoints_Restaurants_RestaurantId",
                table: "LoyaltyPoints",
                column: "RestaurantId",
                principalTable: "Restaurants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoyaltyPoints_AspNetUsers_CustomerId",
                table: "LoyaltyPoints");

            migrationBuilder.DropForeignKey(
                name: "FK_LoyaltyPoints_Orders_OrderId",
                table: "LoyaltyPoints");

            migrationBuilder.DropForeignKey(
                name: "FK_LoyaltyPoints_Restaurants_RestaurantId",
                table: "LoyaltyPoints");

            migrationBuilder.DropTable(
                name: "LoyaltyCodes");

            migrationBuilder.DropIndex(
                name: "IX_LoyaltyPoints_CustomerId_RestaurantId",
                table: "LoyaltyPoints");

            migrationBuilder.AddForeignKey(
                name: "FK_LoyaltyPoints_AspNetUsers_CustomerId",
                table: "LoyaltyPoints",
                column: "CustomerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LoyaltyPoints_Orders_OrderId",
                table: "LoyaltyPoints",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LoyaltyPoints_Restaurants_RestaurantId",
                table: "LoyaltyPoints",
                column: "RestaurantId",
                principalTable: "Restaurants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
