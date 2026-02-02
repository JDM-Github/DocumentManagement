/**
 * ------------------------------------------------------------
 * File: EducationalBackground.js
 * Author: JDM
 * Created: 2026-02-01 15:00:30 (UTC)
 * Description:
 *   Sequelize model for storing a user's educational background,
 *   including elementary, secondary, vocational, college,
 *   and graduate studies.
 * ------------------------------------------------------------
 */

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const EducationalBackground = sequelize.define(
    "EducationalBackground",
    {
        userId: { type: DataTypes.INTEGER, allowNull: false, },

        elementarySchoolName: { type: DataTypes.STRING, allowNull: true },
        elementaryBasicEducation: { type: DataTypes.STRING, allowNull: true },
        elementaryPeriodFrom: { type: DataTypes.DATEONLY, allowNull: true },
        elementaryPeriodTo: { type: DataTypes.DATEONLY, allowNull: true },
        elementaryHighestLevelUnitEarned: { type: DataTypes.STRING, allowNull: true },
        elementaryYearGraduated: { type: DataTypes.STRING, allowNull: true },
        elementaryScholarHonors: { type: DataTypes.STRING, allowNull: true },

        secondarySchoolName: { type: DataTypes.STRING, allowNull: true },
        secondaryBasicEducation: { type: DataTypes.STRING, allowNull: true },
        secondaryPeriodFrom: { type: DataTypes.DATEONLY, allowNull: true },
        secondaryPeriodTo: { type: DataTypes.DATEONLY, allowNull: true },
        secondaryHighestLevelUnitEarned: { type: DataTypes.STRING, allowNull: true },
        secondaryYearGraduated: { type: DataTypes.STRING, allowNull: true },
        secondaryScholarHonors: { type: DataTypes.STRING, allowNull: true },

        vocationalSchoolName: { type: DataTypes.STRING, allowNull: true },
        vocationalBasicEducation: { type: DataTypes.STRING, allowNull: true },
        vocationalPeriodFrom: { type: DataTypes.DATEONLY, allowNull: true },
        vocationalPeriodTo: { type: DataTypes.DATEONLY, allowNull: true },
        vocationalHighestLevelUnitEarned: { type: DataTypes.STRING, allowNull: true },
        vocationalYearGraduated: { type: DataTypes.STRING, allowNull: true },
        vocationalScholarHonors: { type: DataTypes.STRING, allowNull: true },

        collegeSchoolName: { type: DataTypes.STRING, allowNull: true },
        collegeDegreeCourse: { type: DataTypes.STRING, allowNull: true },
        collegePeriodFrom: { type: DataTypes.DATEONLY, allowNull: true },
        collegePeriodTo: { type: DataTypes.DATEONLY, allowNull: true },
        collegeHighestLevelUnitEarned: { type: DataTypes.STRING, allowNull: true },
        collegeYearGraduated: { type: DataTypes.STRING, allowNull: true },
        collegeScholarHonors: { type: DataTypes.STRING, allowNull: true },

        graduateSchoolName: { type: DataTypes.STRING, allowNull: true },
        graduateDegreeCourse: { type: DataTypes.STRING, allowNull: true },
        graduatePeriodFrom: { type: DataTypes.DATEONLY, allowNull: true },
        graduatePeriodTo: { type: DataTypes.DATEONLY, allowNull: true },
        graduateHighestLevelUnitEarned: { type: DataTypes.STRING, allowNull: true },
        graduateYearGraduated: { type: DataTypes.STRING, allowNull: true },
        graduateScholarHonors: { type: DataTypes.STRING, allowNull: true },
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

module.exports = EducationalBackground;
