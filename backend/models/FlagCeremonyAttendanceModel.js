// Author: JDM
// Created on: 2026-02-06T15:54:00.412Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const FlagCeremonyAttendance = sequelize.define(
    "FlagCeremonyAttendance",
    {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },

        ceremonyDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        ceremonyType: {
            type: DataTypes.ENUM("MONDAY", "SPECIAL_OCCASION"),
            allowNull: false,
            defaultValue: "MONDAY",
        },

        checkInTime: {
            type: DataTypes.TIME,
            allowNull: true,
        },

        status: {
            type: DataTypes.ENUM("PRESENT", "LATE", "ABSENT", "EXCUSED"),
            allowNull: false,
            defaultValue: "ABSENT",
        },

        remarks: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: "",
        },

        isExcused: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        excuseReason: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: "",
        },

        recordedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        },

        uploadedProof: {
            type: DataTypes.STRING,
            defaultValue: ""
        }
    },
    {
        timestamps: true,
        paranoid: true,
        indexes: [
            { fields: ["userId"] },
            { fields: ["ceremonyDate"] },
            { fields: ["status"] },
            { fields: ["userId", "ceremonyDate"], unique: true },
        ],
    }
);

module.exports = FlagCeremonyAttendance;