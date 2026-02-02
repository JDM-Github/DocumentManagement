// Author: JDM
// Created on: 2026-01-24

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const Department = sequelize.define(
    "Department",
    {

        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
        },

        code: {
            type: DataTypes.STRING(50),
            allowNull: true,
            unique: true,
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        timestamps: true,
        paranoid: true,
    }
);

module.exports = Department;
