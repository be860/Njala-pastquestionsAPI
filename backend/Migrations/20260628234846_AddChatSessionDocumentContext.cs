using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NjalaAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddChatSessionDocumentContext : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DocumentId",
                table: "ChatSessions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DocumentTitle",
                table: "ChatSessions",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DocumentId",
                table: "ChatSessions");

            migrationBuilder.DropColumn(
                name: "DocumentTitle",
                table: "ChatSessions");
        }
    }
}
