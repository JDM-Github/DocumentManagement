// Author: JDM
// Created on: 2026-02-01T15:01:01.789Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const OtherInformation = sequelize.define(
  "OtherInformation",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    /* =========================
       OTHER INFORMATION (JSON)
    ========================== */
    details: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
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

module.exports = OtherInformation;
