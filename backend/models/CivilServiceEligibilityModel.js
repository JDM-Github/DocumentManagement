// Author: JDM
// Created on: 2026-02-01T15:00:35.452Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const CivilServiceEligibility = sequelize.define(
  "CivilServiceEligibility",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    eligibilities: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      /*
      Example:
      [
        {
          "eligibilityType": "Career Service Professional",
          "rating": "85",
          "examDate": "2015-06-12",
          "examPlace": "Quezon City",
          "licenseNumber": null,
          "idNumber": "CS-12345",
          "validityDate": "2025-06-12"
        },
        {
          "eligibilityType": "Driver's License",
          "rating": null,
          "examDate": "2022-02-15",
          "examPlace": "Makati City",
          "licenseNumber": "DL-98765",
          "idNumber": null,
          "validityDate": "2027-02-15"
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

module.exports = CivilServiceEligibility;
