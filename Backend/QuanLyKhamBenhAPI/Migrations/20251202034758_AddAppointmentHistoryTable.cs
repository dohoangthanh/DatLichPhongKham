using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyKhamBenhAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddAppointmentHistoryTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppointmentHistories",
                columns: table => new
                {
                    HistoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AppointmentId = table.Column<int>(type: "int", nullable: false),
                    OldDate = table.Column<DateOnly>(type: "date", nullable: false),
                    OldTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    OldDoctorId = table.Column<int>(type: "int", nullable: true),
                    NewDate = table.Column<DateOnly>(type: "date", nullable: false),
                    NewTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    NewDoctorId = table.Column<int>(type: "int", nullable: true),
                    ChangedBy = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ChangeReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ChangedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppointmentHistories", x => x.HistoryId);
                    table.ForeignKey(
                        name: "FK_AppointmentHistories_Appointment_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointment",
                        principalColumn: "appointmentId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppointmentHistories_Doctor_NewDoctorId",
                        column: x => x.NewDoctorId,
                        principalTable: "Doctor",
                        principalColumn: "doctorId");
                    table.ForeignKey(
                        name: "FK_AppointmentHistories_Doctor_OldDoctorId",
                        column: x => x.OldDoctorId,
                        principalTable: "Doctor",
                        principalColumn: "doctorId");
                });

            migrationBuilder.CreateTable(
                name: "ChatKnowledges",
                columns: table => new
                {
                    KnowledgeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Question = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Answer = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "general"),
                    UsageCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    LastUsedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatKnowledges", x => x.KnowledgeId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppointmentHistories_AppointmentId",
                table: "AppointmentHistories",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AppointmentHistories_NewDoctorId",
                table: "AppointmentHistories",
                column: "NewDoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_AppointmentHistories_OldDoctorId",
                table: "AppointmentHistories",
                column: "OldDoctorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppointmentHistories");

            migrationBuilder.DropTable(
                name: "ChatKnowledges");
        }
    }
}
