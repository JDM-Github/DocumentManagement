// Author: JDM
// Created on: 2026-02-01T15:00:22.472Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const PersonalInformation = sequelize.define(
    "PersonalInformation",
    {
        userId: { type: DataTypes.INTEGER, allowNull: false },
        surname: { type: DataTypes.STRING, allowNull: false, },
        firstName: { type: DataTypes.STRING, allowNull: false, },
        middleName: { type: DataTypes.STRING, allowNull: true, },
        nameExtension: { type: DataTypes.STRING, allowNull: true, },
        dateOfBirth: { type: DataTypes.DATEONLY, allowNull: false, },
        placeOfBirth: { type: DataTypes.STRING, allowNull: false, },
        height: { type: DataTypes.STRING, allowNull: true, },
        weight: { type: DataTypes.STRING, allowNull: true, },
        bloodType: { type: DataTypes.STRING, allowNull: true, },
        sex: { type: DataTypes.ENUM("Male", "Female"), allowNull: false, },
        civilStatus: { type: DataTypes.ENUM("Single", "Married", "Widowed", "Separated", "Others"), allowNull: false, },
        civilStatusOther: { type: DataTypes.STRING, allowNull: true, },
        citizenship: { type: DataTypes.ENUM("Filipino", "Dual Citizenship"), allowNull: false, },
        dualCitizenshipType: { type: DataTypes.ENUM("By Birth", "By Naturalization"), allowNull: true, },
        dualCitizenshipDetails: { type: DataTypes.STRING, allowNull: true, },
        telephoneNo: { type: DataTypes.STRING, allowNull: true, },
        mobileNo: { type: DataTypes.STRING, allowNull: false, },
        emailAddress: { type: DataTypes.STRING, allowNull: true, validate: { isEmail: true, }, },
        gsisIdNo: { type: DataTypes.STRING, allowNull: true, },
        pagibigIdNo: { type: DataTypes.STRING, allowNull: true, },
        philhealthNo: { type: DataTypes.STRING, allowNull: true, },
        sssNo: { type: DataTypes.STRING, allowNull: true, },
        tinNo: { type: DataTypes.STRING, allowNull: true, },
        agencyEmployeeNo: { type: DataTypes.STRING, allowNull: true, },
        houseBlockLotNo: { type: DataTypes.STRING, allowNull: true, },
        street: { type: DataTypes.STRING, allowNull: true, },
        subdivisionVillage: { type: DataTypes.STRING, allowNull: true, },
        barangay: { type: DataTypes.STRING, allowNull: true, },
        cityMunicipality: { type: DataTypes.STRING, allowNull: true, },
        province: { type: DataTypes.STRING, allowNull: true, },
        zipCode: { type: DataTypes.STRING, allowNull: true, },
        permanentHouseBlockLotNo: { type: DataTypes.STRING, allowNull: true, },
        permanentStreet: { type: DataTypes.STRING, allowNull: true, },
        permanentSubdivisionVillage: { type: DataTypes.STRING, allowNull: true, },
        permanentBarangay: { type: DataTypes.STRING, allowNull: true, },
        permanentCityMunicipality: { type: DataTypes.STRING, allowNull: true, },
        permanentProvince: { type: DataTypes.STRING, allowNull: true, },
        permanentZipCode: { type: DataTypes.STRING, allowNull: true, },
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

module.exports = PersonalInformation;
