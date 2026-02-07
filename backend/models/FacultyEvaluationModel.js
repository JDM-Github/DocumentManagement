// Author: JDM
// Created on: 2026-02-05T13:31:01.926Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const FacultyEvaluation = sequelize.define(
    "FacultyEvaluation",
    {
        facultyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        evaluatorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 4,
            },
        },

        uniqueCode: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },

        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        status: {
            type: DataTypes.ENUM("ACTIVE", "ARCHIVED"),
            allowNull: false,
            defaultValue: "ACTIVE",
        },

        academicPeriod: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
    },
    {
        timestamps: true,
        indexes: [
            { fields: ["facultyId"] },
            { fields: ["evaluatorId"] },
            { fields: ["departmentId"] },
            { fields: ["uniqueCode"] },
            { fields: ["status"] },
            {
                fields: ["facultyId", "evaluatorId"],
                unique: true,
                name: "unique_faculty_evaluator"
            },
        ],
    }
);

module.exports = FacultyEvaluation;