// Author: JDM
// Created on: 2026-01-31T13:05:33.158Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const Announcement = sequelize.define(
    "Announcement",
    {
        // Define model attributes here
    },
    {
        timestamps: true,
    }
);

module.exports = Announcement;
