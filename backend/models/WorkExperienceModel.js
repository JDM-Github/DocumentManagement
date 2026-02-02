// Author: JDM
// Created on: 2026-02-01T15:00:41.322Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const WorkExperience = sequelize.define(
  "WorkExperience",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    /* =========================
       WORK EXPERIENCE ENTRIES (JSON)
    ========================== */
    experiences: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      /*
      Example:
      [
        {
          "dateFrom": "2015-06-01",
          "dateTo": "2018-05-31",
          "positionTitle": "Administrative Officer",
          "departmentAgency": "Department of Education",
          "monthlySalary": "25000",
          "salaryJobPayGrade": "12-1",
          "statusOfAppointment": "Permanent",
          "governmentService": true
        },
        {
          "dateFrom": "2018-06-01",
          "dateTo": "2022-12-31",
          "positionTitle": "HR Officer",
          "departmentAgency": "Private Company Ltd.",
          "monthlySalary": "35000",
          "salaryJobPayGrade": null,
          "statusOfAppointment": "Contractual",
          "governmentService": false
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

module.exports = WorkExperience;
