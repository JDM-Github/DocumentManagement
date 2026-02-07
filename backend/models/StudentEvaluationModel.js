// Author: JDM
// Created on: 2026-02-05

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const StudentEvaluation = sequelize.define(
    "StudentEvaluation",
    {
        facultyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        studentId: {
            type: DataTypes.STRING(20),
            allowNull: true,
            validate: {
                is: /^\d{4}-\d{5}$/,
            },
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
                max: 5,
            },
        },

        courseCode: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },

        academicPeriod: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },

        uniqueCode: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },

        status: {
            type: DataTypes.ENUM("ACTIVE", "ARCHIVED", "FLAGGED"),
            allowNull: false,
            defaultValue: "ACTIVE",
        },

        ipAddress: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
    },
    {
        timestamps: true,
        indexes: [
            { fields: ["facultyId"] },
            { fields: ["uniqueCode"] },
            { fields: ["academicPeriod"] },
            { fields: ["status"] },
            {
                fields: ["studentId", "uniqueCode", "academicPeriod"],
                unique: true,
                name: "unique_student_evaluation"
            },
        ],
    }
);

module.exports = StudentEvaluation;