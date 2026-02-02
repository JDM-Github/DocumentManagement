// Author: JDM
// Created on: 2026-02-01T15:23:02.283Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const FamilyBackground = sequelize.define(
    "FamilyBackground",
    {
        userId: { type: DataTypes.INTEGER, allowNull: false, },
        spouseSurname: { type: DataTypes.STRING, allowNull: true, },
        spouseFirstName: { type: DataTypes.STRING, allowNull: true, },
        spouseMiddleName: { type: DataTypes.STRING, allowNull: true, },
        spouseNameExtension: { type: DataTypes.STRING, allowNull: true, },
        spouseOccupation: { type: DataTypes.STRING, allowNull: true, },
        employerBusinessName: { type: DataTypes.STRING, allowNull: true, },
        businessAddress: { type: DataTypes.STRING, allowNull: true, },
        spouseTelephoneNo: { type: DataTypes.STRING, allowNull: true, },
        fatherSurname: { type: DataTypes.STRING, allowNull: true, },
        fatherFirstName: { type: DataTypes.STRING, allowNull: true, },
        fatherMiddleName: { type: DataTypes.STRING, allowNull: true, },
        fatherNameExtension: { type: DataTypes.STRING, allowNull: true, },
        motherMaidenName: { type: DataTypes.STRING, allowNull: true, },
        motherSurname: { type: DataTypes.STRING, allowNull: true, },
        motherFirstName: { type: DataTypes.STRING, allowNull: true, },
        motherMiddleName: { type: DataTypes.STRING, allowNull: true, },
        /* =========================
           CHILDREN (JSON)
           Example:
           [
             { "fullName": "Juan D. Cruz", "dateOfBirth": "2015-06-12" }
           ]
        ========================== */
        children: { type: DataTypes.JSON, allowNull: true, defaultValue: [], },
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

module.exports = FamilyBackground;
