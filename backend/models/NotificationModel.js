// Author: JDM
// Created on: 2026-01-31T13:05:24.057Z
const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const Notification = sequelize.define(
    "Notification",
    {
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('info', 'warning', 'success', 'error', 'document', 'request'),
            defaultValue: 'info',
        },
        read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        metadata: {
            type: DataTypes.JSON,
            defaultValue: {},
        },
        link: {
            type: DataTypes.STRING(500),
            allowNull: true,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = Notification;