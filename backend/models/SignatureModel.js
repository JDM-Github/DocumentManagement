// Author: JDM
// Created on: 2026-01-24

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const Signature = sequelize.define(
    "Signature",
    {
        requestLetterId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        signedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
    },
    {
        timestamps: true,
        paranoid: true,
        indexes: [
            { fields: ["requestLetterId"] },
            { fields: ["userId"] },
        ],
    }
);

module.exports = Signature;