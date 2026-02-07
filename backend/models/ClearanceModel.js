// Author: JDM
// Created on: 2026-02-01T02:36:57.060Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const Clearance = sequelize.define(
    "Clearance",
    {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "User requesting the clearance",
        },
        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "User to determine what is this user department"
        },

        salary: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: "User salary at the time of clearance",
        },

        position: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "User position",
        },

        employmentStatus: {
            type: DataTypes.ENUM("EMPLOYEE", "FACULTY"),
            allowNull: false,
            comment: "Employment classification",
        },

        purpose: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "Purpose of the clearance",
        },

        effectiveFrom: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: "Clearance effective start date",
        },

        effectiveTo: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: "Clearance effective end date",
        },

        status: {
            type: DataTypes.ENUM(
                "PENDING",
                "APPROVED BY DEAN",
                "APPROVED BY PRESIDENT",
                "REJECTED"
            ),
            allowNull: false,
            defaultValue: "PENDING",
        },

        isInDean: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: "Currently under dean review",
        },

        isInPresident: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: "Currently under president review",
        },

        isHaveDeanSignature: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: "Dean has signed the clearance",
        },

        isHavePresidentSignature: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: "President has signed the clearance",
        },
    },
    {
        timestamps: true,
        paranoid: true,
        indexes: [
            { fields: ["userId"] },
            { fields: ["employmentStatus"] },
            { fields: ["status"] },
            { fields: ["isInDean"] },
            { fields: ["isInPresident"] },
        ],
    }
);

module.exports = Clearance;
