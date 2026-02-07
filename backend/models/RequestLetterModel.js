// Author: JDM
// Created on: 2026-01-24

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const RequestLetter = sequelize.define(
    "RequestLetter",
    {
        requestNo: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },

        requesterId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        requesterName: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },

        requestUploadedDocuments: {
            type: DataTypes.STRING,
            defaultValue: null,
        },

        purpose: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        status: {
            type: DataTypes.ENUM(
                "ONGOING",
                "TO_RECEIVE",
                "TO_RELEASE",
                "REVIEWED",
                "DECLINED",
                "SENT TO DEAN",
                "SENT TO PRESIDENT",
                "COMPLETED",
                "DELETED"
            ),
            allowNull: false,
            defaultValue: "TO_RECEIVE",
        },
        lastDepartmentId: {
            type: DataTypes.INTEGER,
            defaultValue: null
        },
        currentDepartmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        allSignature: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            defaultValue: [],
        },

        isInDean: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isInPresident: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        isHaveDeanSignature: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isHavePresidentSignature: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }

    },
    {
        timestamps: true,
        paranoid: true,
        indexes: [
            { fields: ["requestNo"] },
            { fields: ["status"] },
            { fields: ["currentDepartmentId"] },
            { fields: ["requesterId"] }
        ],
    }
);

module.exports = RequestLetter;
