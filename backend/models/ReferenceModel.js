// Author: JDM
// Created on: 2026-02-01T15:00:46.156Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const Reference = sequelize.define(
    "Reference",
    {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        /* =========================
           REFERENCE ENTRIES (JSON)
        ========================== */
        references: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
            /*
            Example:
            [
              {
                "name": "",
                "address": "",
                "telephone": "",
              },
            ]
            */
        },
    },
    {
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["userId"],
            },
        ],
    }
);

module.exports = Reference;
