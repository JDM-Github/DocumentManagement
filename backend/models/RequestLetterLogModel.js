// Author: JDM
// Created on: 2026-01-24

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const RequestLetterLog = sequelize.define(
    "RequestLetterLog",
    {
        requestLetterId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        action: {
            type: DataTypes.ENUM(
                "CREATED",
                "RECEIVED",
                "FORWARDED",
                "REVIEWED",
                "RELEASED",
                "DECLINED",
                "COMPLETED",
                "DELETED"
            ),
            allowNull: false,
        },

        fromDepartmentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        toDepartmentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        actedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        remarks: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = RequestLetterLog;
