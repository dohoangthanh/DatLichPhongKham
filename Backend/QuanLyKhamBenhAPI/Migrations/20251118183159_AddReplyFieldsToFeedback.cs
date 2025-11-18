using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyKhamBenhAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddReplyFieldsToFeedback : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "RepliedDate",
                table: "Feedback",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReplyText",
                table: "Feedback",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RepliedDate",
                table: "Feedback");

            migrationBuilder.DropColumn(
                name: "ReplyText",
                table: "Feedback");
        }
    }
}
