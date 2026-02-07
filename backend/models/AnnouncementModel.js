// Author: JDM
// Created on: 2026-02-07T18:37:23.125Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const Announcement = sequelize.define(
    "Announcement",
    {
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('general', 'maintenance', 'update', 'event', 'urgent'),
            defaultValue: 'general',
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
            defaultValue: 'medium',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        targetAudience: {
            type: DataTypes.ENUM('all', 'students', 'faculty', 'staff', 'admins'),
            defaultValue: 'all',
        },
        metadata: {
            type: DataTypes.JSON,
            defaultValue: {},
        },
        link: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        authorId: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = Announcement;