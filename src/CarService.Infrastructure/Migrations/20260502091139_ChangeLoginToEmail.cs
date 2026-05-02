using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangeLoginToEmail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Login",
                table: "Users",
                newName: "Email");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Email",
                table: "Users",
                newName: "Login");
        }
    }
}
