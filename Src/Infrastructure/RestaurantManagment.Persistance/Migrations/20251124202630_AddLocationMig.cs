using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantManagment.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class AddLocationMig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Önce mevcut string değerleri enum değerlerine çevir
            migrationBuilder.Sql(@"
                UPDATE Tables 
                SET Location = CASE 
                    WHEN Location LIKE '%İç%' OR Location LIKE '%Ic%' OR Location = 'İç Mekan' THEN '1'
                    WHEN Location LIKE '%Pencere%' THEN '2'
                    WHEN Location LIKE '%Dış%' OR Location LIKE '%Dis%' OR Location = 'Dış Mekan' THEN '3'
                    ELSE NULL
                END
                WHERE Location IS NOT NULL
            ");

            // Sonra column type'ı int'e çevir
            migrationBuilder.AlterColumn<int>(
                name: "Location",
                table: "Tables",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Önce column type'ı string'e çevir
            migrationBuilder.AlterColumn<string>(
                name: "Location",
                table: "Tables",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            // Sonra enum değerlerini string'e çevir
            migrationBuilder.Sql(@"
                UPDATE Tables 
                SET Location = CASE 
                    WHEN Location = '1' THEN 'İç Mekan'
                    WHEN Location = '2' THEN 'Pencere Kenarı'
                    WHEN Location = '3' THEN 'Dışarı'
                    ELSE NULL
                END
                WHERE Location IS NOT NULL
            ");
        }
    }
}
