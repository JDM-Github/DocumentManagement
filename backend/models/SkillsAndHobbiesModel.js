// Author: JDM
// Created on: 2026-02-01T15:00:56.456Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const SkillsAndHobbies = sequelize.define(
  "SkillsAndHobbies",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    /* =========================
       ALL SKILLS, DISTINCTIONS, AND MEMBERSHIPS AS ARRAY OF OBJECTS
    ========================== */
    entries: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      /*
      Example:
      [
        {
          "specialSkillsHobby": "Photography",
          "distinction": "",
          "membership": ""
        },
        {
          "specialSkillsHobby": "Web Development",
          "distinction": "Employee of the Month, July 2021",
          "membership": "Rotary Club of Manila"
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

module.exports = SkillsAndHobbies;
