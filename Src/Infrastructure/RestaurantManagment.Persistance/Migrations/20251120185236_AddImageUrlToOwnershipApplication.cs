using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantManagment.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class AddImageUrlToOwnershipApplication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "OwnershipApplications",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "OwnershipApplications");
        }
    }
}
