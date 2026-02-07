// Author: JDM
// Created on: 2026-02-01T02:36:57.060Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const PassSlip = sequelize.define(
    "PassSlip",
    {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "User requesting the pass slip",
        },
        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "User to determine what is this user department"
        },
        timeOut: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: "Time the user wants to leave",
        },

        timeIn: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "Expected return time",
        },

        purpose: {
            type: DataTypes.ENUM("PERSONAL", "OFFICIAL"),
            allowNull: false,
        },

        reason: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        forwardToHR: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: "Whether this pass slip is forwarded to HR",
        },
        status: {
            type: DataTypes.ENUM("PENDING", "APPROVED BY DEAN", "APPROVED BY PRESIDENT", "REJECTED"),
            allowNull: false,
            defaultValue: "PENDING",
        },

        isInDean: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
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
    {
        timestamps: true,
        paranoid: true,
        indexes: [
            { fields: ["userId"] },
            { fields: ["departmentId"] },
            { fields: ["purpose"] },
            { fields: ["status"] },
            { fields: ["forwardToHR"] },
        ],
    }
);

module.exports = PassSlip;
