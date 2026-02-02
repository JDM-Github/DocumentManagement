// Author: JDM
// Created on: 2026-02-01T15:00:51.123Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const LearningAndDevelopment = sequelize.define(
  "LearningAndDevelopment",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    /* =========================
       TRAINING / LEARNING AND DEVELOPMENT ENTRIES (JSON)
    ========================== */
    trainings: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      /*
      Example:
      [
        {
          "title": "Advanced Leadership Program",
          "dateFrom": "2022-05-10",
          "dateTo": "2022-05-20",
          "numberOfHours": 40,
          "type": "Managerial",
          "conductedBy": "Civil Service Commission"
        },
        {
          "title": "Technical Writing Workshop",
          "dateFrom": "2021-08-15",
          "dateTo": "2021-08-17",
          "numberOfHours": 16,
          "type": "Technical",
          "conductedBy": "Department of Education"
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

module.exports = LearningAndDevelopment;
