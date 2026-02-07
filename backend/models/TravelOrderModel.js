// Author: JDM
// Created on: 2026-02-06

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const TravelOrder = sequelize.define(
    "TravelOrder",
    {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "User requesting the travel order",
        },
        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "User to determine what is this user department"
        },
        transportationUsed: {
            type: DataTypes.ENUM("PRIVATE_VEHICLE", "COMMUTE", "SCHOOL_VEHICLE"),
            allowNull: false,
            comment: "Mode of transportation",
        },
        destination: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "Destination address or location",
        },
        dateOfDepartureFrom: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            comment: "Start date of travel",
        },
        dateOfDepartureTo: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            comment: "End date of travel",
        },
        timeOfDeparture: {
            type: DataTypes.TIME,
            allowNull: false,
            comment: "Time of departure",
        },
        timeOfArrival: {
            type: DataTypes.TIME,
            allowNull: true,
            comment: "Expected time of arrival",
        },
        purpose: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "Purpose/reason for travel",
        },
        purposeType: {
            type: DataTypes.ENUM("OFFICIAL_BUSINESS", "OFFICIAL_TIME"),
            allowNull: false,
            comment: "Type of official purpose",
        },
        attachedFile: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: "Path to attached supporting document",
        },
        forwardToHR: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: "Whether this travel order is forwarded to HR",
        },
        status: {
            type: DataTypes.ENUM("PENDING", "APPROVED BY DEAN", "APPROVED BY PRESIDENT", "REJECTED"),
            allowNull: false,
            defaultValue: "PENDING",
        },
        isInDean: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: "Currently at Dean level for approval",
        },
        isInPresident: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: "Currently at President level for approval",
        },
        isHaveDeanSignature: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: "Dean has signed the travel order",
        },
        isHavePresidentSignature: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: "President has signed the travel order",
        }
    },
    {
        timestamps: true,
        paranoid: true,
        indexes: [
            { fields: ["userId"] },
            { fields: ["departmentId"] },
            { fields: ["transportationUsed"] },
            { fields: ["purposeType"] },
            { fields: ["status"] },
            { fields: ["forwardToHR"] },
            { fields: ["dateOfDepartureFrom"] },
            { fields: ["dateOfDepartureTo"] },
        ],
    }
);

module.exports = TravelOrder;