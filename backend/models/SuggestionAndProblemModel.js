// Author: JDM
// Created on: 2026-02-06T16:13:39.344Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const SuggestionAndProblem = sequelize.define(
    "SuggestionAndProblem",
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

        type: {
            type: DataTypes.ENUM("SUGGESTION", "PROBLEM"),
            allowNull: false,
        },

        category: {
            type: DataTypes.ENUM(
                "FACILITIES",
                "ACADEMIC",
                "ADMINISTRATIVE",
                "TECHNOLOGY",
                "SAFETY",
                "HR",
                "OTHER"
            ),
            allowNull: false,
        },

        subject: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        priority: {
            type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "URGENT"),
            allowNull: false,
            defaultValue: "MEDIUM",
        },

        status: {
            type: DataTypes.ENUM(
                "PENDING",
                "UNDER_REVIEW",
                "IN_PROGRESS",
                "RESOLVED",
                "REJECTED"
            ),
            allowNull: false,
            defaultValue: "PENDING",
        },

        attachedFile: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },

        isAnonymous: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Departments',
                key: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        },

        reviewedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        },

        reviewedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        adminResponse: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: "",
        },

        resolvedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        timestamps: true,
        paranoid: true,
        indexes: [
            { fields: ["userId"] },
            { fields: ["type"] },
            { fields: ["category"] },
            { fields: ["status"] },
            { fields: ["priority"] },
            { fields: ["departmentId"] },
        ],
    }
);

module.exports = SuggestionAndProblem;