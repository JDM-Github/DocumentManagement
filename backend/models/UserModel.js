// Author: JDM
// Updated on: 2026-02-02

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const User = sequelize.define(
    "User",
    {
        // Basic Information
        employeeNo: {
            type: DataTypes.STRING(50),
            allowNull: true,
            unique: true,
        },

        firstName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        middleName: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: "",
        },

        lastName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        // Contact Information
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },

        contactNumber: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: "",
        },

        // Address
        streetAddress: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: "",
        },

        barangay: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: "",
        },

        city: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: "",
        },

        province: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: "",
        },

        postalCode: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: "",
        },

        // Personal Information
        dateOfBirth: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },

        gender: {
            type: DataTypes.ENUM("MALE", "FEMALE", "OTHER"),
            allowNull: true,
        },

        // Employment Information
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        role: {
            type: DataTypes.ENUM("USER", "ADMIN", "HEAD"),
            allowNull: false,
            defaultValue: "USER",
        },

        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        jobTitle: {
            type: DataTypes.STRING(150),
            allowNull: true,
            defaultValue: "",
        },

        dateHired: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },

        employmentStatus: {
            type: DataTypes.ENUM("ACTIVE", "INACTIVE", "ON_LEAVE"),
            allowNull: false,
            defaultValue: "ACTIVE",
        },

        // Emergency Contact
        emergencyContactName: {
            type: DataTypes.STRING(150),
            allowNull: true,
            defaultValue: "",
        },

        emergencyContactNumber: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: "",
        },

        emergencyContactRelationship: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: "",
        },

        // System
        profilePhoto: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },

        lastLoginAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        timestamps: true,
        paranoid: true,
        indexes: [
            { fields: ["email"] },
            { fields: ["departmentId"] },
            { fields: ["role"] },
            { fields: ["employeeNo"] },
        ],
    }
);

module.exports = User;