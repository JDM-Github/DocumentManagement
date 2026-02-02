// models/AccomplishmentEntry.js
const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const AccomplishmentEntry = sequelize.define(
    "AccomplishmentEntry",
    {
        reportId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        activities: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        signedBy: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    { timestamps: true }
);

module.exports = AccomplishmentEntry;
