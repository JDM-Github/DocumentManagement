// Author: JDM
// Created on: 2026-02-01T15:00:46.156Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const VoluntaryWork = sequelize.define(
    "VoluntaryWork",
    {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        /* =========================
           VOLUNTARY WORK ENTRIES (JSON)
        ========================== */
        entries: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
            /*
            Example:
            [
              {
                "organizationName": "Red Cross Philippines",
                "organizationAddress": "Makati City",
                "dateFrom": "2020-01-15",
                "dateTo": "2020-06-15",
                "numberOfHours": 120,
                "positionNatureOfWork": "Volunteer Nurse"
              },
              {
                "organizationName": "Community Youth Outreach",
                "organizationAddress": "Quezon City",
                "dateFrom": "2019-03-01",
                "dateTo": "2019-12-01",
                "numberOfHours": 80,
                "positionNatureOfWork": "Project Coordinator"
              }
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

module.exports = VoluntaryWork;
