using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyKhamBenhAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Patient",
                columns: table => new
                {
                    patientId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    dob = table.Column<DateOnly>(type: "date", nullable: true),
                    gender = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Patient__A17005EC6575D4A7", x => x.patientId);
                });

            migrationBuilder.CreateTable(
                name: "Promotion",
                columns: table => new
                {
                    promoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    discountPercent = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    startDate = table.Column<DateOnly>(type: "date", nullable: true),
                    endDate = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Promotio__E19E71F6D52E2CA9", x => x.promoId);
                });

            migrationBuilder.CreateTable(
                name: "Service",
                columns: table => new
                {
                    serviceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Service__455070DF9211E9E6", x => x.serviceId);
                });

            migrationBuilder.CreateTable(
                name: "Specialty",
                columns: table => new
                {
                    specialtyId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Specialt__81FB91AEE20C0732", x => x.specialtyId);
                });

            migrationBuilder.CreateTable(
                name: "LoyaltyPoints",
                columns: table => new
                {
                    pointsId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    points = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    lastUpdated = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    patientId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__LoyaltyP__1EA67FA8ED442AEE", x => x.pointsId);
                    table.ForeignKey(
                        name: "FK__LoyaltyPo__patie__628FA481",
                        column: x => x.patientId,
                        principalTable: "Patient",
                        principalColumn: "patientId");
                });

            migrationBuilder.CreateTable(
                name: "Doctor",
                columns: table => new
                {
                    doctorId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    specialtyId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Doctor__7224847680FA0289", x => x.doctorId);
                    table.ForeignKey(
                        name: "FK__Doctor__specialt__398D8EEE",
                        column: x => x.specialtyId,
                        principalTable: "Specialty",
                        principalColumn: "specialtyId");
                });

            migrationBuilder.CreateTable(
                name: "Appointment",
                columns: table => new
                {
                    appointmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    time = table.Column<TimeOnly>(type: "time", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    patientId = table.Column<int>(type: "int", nullable: true),
                    doctorId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Appointm__D06765FEECC8698C", x => x.appointmentId);
                    table.ForeignKey(
                        name: "FK__Appointme__docto__46E78A0C",
                        column: x => x.doctorId,
                        principalTable: "Doctor",
                        principalColumn: "doctorId");
                    table.ForeignKey(
                        name: "FK__Appointme__patie__45F365D3",
                        column: x => x.patientId,
                        principalTable: "Patient",
                        principalColumn: "patientId");
                });

            migrationBuilder.CreateTable(
                name: "Feedback",
                columns: table => new
                {
                    feedbackId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    rating = table.Column<int>(type: "int", nullable: true),
                    comment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    createdDate = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    patientId = table.Column<int>(type: "int", nullable: true),
                    doctorId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Feedback__2613FD24E68EE594", x => x.feedbackId);
                    table.ForeignKey(
                        name: "FK__Feedback__doctor__68487DD7",
                        column: x => x.doctorId,
                        principalTable: "Doctor",
                        principalColumn: "doctorId");
                    table.ForeignKey(
                        name: "FK__Feedback__patien__6754599E",
                        column: x => x.patientId,
                        principalTable: "Patient",
                        principalColumn: "patientId");
                });

            migrationBuilder.CreateTable(
                name: "UserAccount",
                columns: table => new
                {
                    userId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    passwordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    doctorId = table.Column<int>(type: "int", nullable: true),
                    patientId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__UserAcco__CB9A1CFFF0632199", x => x.userId);
                    table.ForeignKey(
                        name: "FK__UserAccou__docto__3F466844",
                        column: x => x.doctorId,
                        principalTable: "Doctor",
                        principalColumn: "doctorId");
                    table.ForeignKey(
                        name: "FK__UserAccou__patie__403A8C7D",
                        column: x => x.patientId,
                        principalTable: "Patient",
                        principalColumn: "patientId");
                });

            migrationBuilder.CreateTable(
                name: "WorkShift",
                columns: table => new
                {
                    shiftId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    startTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    endTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    doctorId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__WorkShif__F2F06B02BBC70987", x => x.shiftId);
                    table.ForeignKey(
                        name: "FK__WorkShift__docto__4316F928",
                        column: x => x.doctorId,
                        principalTable: "Doctor",
                        principalColumn: "doctorId");
                });

            migrationBuilder.CreateTable(
                name: "AppointmentService",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    appointmentId = table.Column<int>(type: "int", nullable: true),
                    serviceId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Appointm__3213E83FB9DCB773", x => x.id);
                    table.ForeignKey(
                        name: "FK__Appointme__appoi__4BAC3F29",
                        column: x => x.appointmentId,
                        principalTable: "Appointment",
                        principalColumn: "appointmentId");
                    table.ForeignKey(
                        name: "FK__Appointme__servi__4CA06362",
                        column: x => x.serviceId,
                        principalTable: "Service",
                        principalColumn: "serviceId");
                });

            migrationBuilder.CreateTable(
                name: "MedicalRecord",
                columns: table => new
                {
                    recordId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    symptoms = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    diagnosis = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    treatment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    createdDate = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    appointmentId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__MedicalR__D825195E5D123E61", x => x.recordId);
                    table.ForeignKey(
                        name: "FK__MedicalRe__appoi__5070F446",
                        column: x => x.appointmentId,
                        principalTable: "Appointment",
                        principalColumn: "appointmentId");
                });

            migrationBuilder.CreateTable(
                name: "Payment",
                columns: table => new
                {
                    paymentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    totalAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    paymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    paymentDate = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    appointmentId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Payment__A0D9EFC6E22338D3", x => x.paymentId);
                    table.ForeignKey(
                        name: "FK__Payment__appoint__5812160E",
                        column: x => x.appointmentId,
                        principalTable: "Appointment",
                        principalColumn: "appointmentId");
                });

            migrationBuilder.CreateTable(
                name: "LabResult",
                columns: table => new
                {
                    resultId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    resultDetails = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    resultDate = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    recordId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__LabResul__C6EADC5B3EA11DC3", x => x.resultId);
                    table.ForeignKey(
                        name: "FK__LabResult__recor__5441852A",
                        column: x => x.recordId,
                        principalTable: "MedicalRecord",
                        principalColumn: "recordId");
                });

            migrationBuilder.CreateTable(
                name: "PaymentPromotion",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    paymentId = table.Column<int>(type: "int", nullable: true),
                    promoId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__PaymentP__3213E83FB9B7E1C8", x => x.id);
                    table.ForeignKey(
                        name: "FK__PaymentPr__payme__5CD6CB2B",
                        column: x => x.paymentId,
                        principalTable: "Payment",
                        principalColumn: "paymentId");
                    table.ForeignKey(
                        name: "FK__PaymentPr__promo__5DCAEF64",
                        column: x => x.promoId,
                        principalTable: "Promotion",
                        principalColumn: "promoId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Appointment_doctorId",
                table: "Appointment",
                column: "doctorId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointment_patientId",
                table: "Appointment",
                column: "patientId");

            migrationBuilder.CreateIndex(
                name: "IX_AppointmentService_appointmentId",
                table: "AppointmentService",
                column: "appointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AppointmentService_serviceId",
                table: "AppointmentService",
                column: "serviceId");

            migrationBuilder.CreateIndex(
                name: "IX_Doctor_specialtyId",
                table: "Doctor",
                column: "specialtyId");

            migrationBuilder.CreateIndex(
                name: "IX_Feedback_doctorId",
                table: "Feedback",
                column: "doctorId");

            migrationBuilder.CreateIndex(
                name: "IX_Feedback_patientId",
                table: "Feedback",
                column: "patientId");

            migrationBuilder.CreateIndex(
                name: "IX_LabResult_recordId",
                table: "LabResult",
                column: "recordId");

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyPoints_patientId",
                table: "LoyaltyPoints",
                column: "patientId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecord_appointmentId",
                table: "MedicalRecord",
                column: "appointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_appointmentId",
                table: "Payment",
                column: "appointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentPromotion_paymentId",
                table: "PaymentPromotion",
                column: "paymentId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentPromotion_promoId",
                table: "PaymentPromotion",
                column: "promoId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAccount_doctorId",
                table: "UserAccount",
                column: "doctorId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAccount_patientId",
                table: "UserAccount",
                column: "patientId");

            migrationBuilder.CreateIndex(
                name: "UQ__UserAcco__F3DBC57263F32EF0",
                table: "UserAccount",
                column: "username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkShift_doctorId",
                table: "WorkShift",
                column: "doctorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppointmentService");

            migrationBuilder.DropTable(
                name: "AppSettings");

            migrationBuilder.DropTable(
                name: "Feedback");

            migrationBuilder.DropTable(
                name: "LabResult");

            migrationBuilder.DropTable(
                name: "LoyaltyPoints");

            migrationBuilder.DropTable(
                name: "PaymentPromotion");

            migrationBuilder.DropTable(
                name: "UserAccount");

            migrationBuilder.DropTable(
                name: "WorkShift");

            migrationBuilder.DropTable(
                name: "Service");

            migrationBuilder.DropTable(
                name: "MedicalRecord");

            migrationBuilder.DropTable(
                name: "Payment");

            migrationBuilder.DropTable(
                name: "Promotion");

            migrationBuilder.DropTable(
                name: "Appointment");

            migrationBuilder.DropTable(
                name: "Doctor");

            migrationBuilder.DropTable(
                name: "Patient");

            migrationBuilder.DropTable(
                name: "Specialty");
        }
    }
}
