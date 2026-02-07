// models/AccomplishmentReport.js
const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const AccomplishmentReport = sequelize.define(
    "AccomplishmentReport",
    {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        uploadedUrl: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("PENDING", "APPROVED BY DEAN", "APPROVED BY PRESIDENT", "REJECTED"),
            allowNull: false,
            defaultValue: "PENDING",
        },
        isInDean: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isInPresident: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isHaveDeanSignature: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isHavePresidentSignature: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    { timestamps: true }
);

module.exports = AccomplishmentReport;
