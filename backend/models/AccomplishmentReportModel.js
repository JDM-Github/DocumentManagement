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
    },
    { timestamps: true }
);

module.exports = AccomplishmentReport;
