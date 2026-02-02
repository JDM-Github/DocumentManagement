// Author: JDM
// Created on: 2026-02-02T01:46:38.915Z

const express = require("express");
const { EducationalBackground } = require("../models/Models");

class EducationalBackgroundRouter {
    constructor() {
        this.router = express.Router();
        this.getRouter();
        this.postRouter();
    }

    getRouter() {
		this.router.post("/find-or-create", async (req, res) => {
			try {
				const userId = req.user?.userId;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User ID is required",
					});
				}

				const defaultData = {
					elementarySchoolName: "",
					elementaryBasicEducation: "",
					elementaryPeriodFrom: null,
					elementaryPeriodTo: null,
					elementaryHighestLevelUnitEarned: "",
					elementaryYearGraduated: "",
					elementaryScholarHonors: "",

					secondarySchoolName: "",
					secondaryBasicEducation: "",
					secondaryPeriodFrom: null,
					secondaryPeriodTo: null,
					secondaryHighestLevelUnitEarned: "",
					secondaryYearGraduated: "",
					secondaryScholarHonors: "",

					vocationalSchoolName: "",
					vocationalBasicEducation: "",
					vocationalPeriodFrom: null,
					vocationalPeriodTo: null,
					vocationalHighestLevelUnitEarned: "",
					vocationalYearGraduated: "",
					vocationalScholarHonors: "",

					collegeSchoolName: "",
					collegeDegreeCourse: "",
					collegePeriodFrom: null,
					collegePeriodTo: null,
					collegeHighestLevelUnitEarned: "",
					collegeYearGraduated: "",
					collegeScholarHonors: "",

					graduateSchoolName: "",
					graduateDegreeCourse: "",
					graduatePeriodFrom: null,
					graduatePeriodTo: null,
					graduateHighestLevelUnitEarned: "",
					graduateYearGraduated: "",
					graduateScholarHonors: "",
				};

				const [educationalBackground, created] =
					await EducationalBackground.findOrCreate({
						where: { userId },
						defaults: {
							userId,
							...defaultData,
						},
					});

				const { id, userId: _userId, createdAt, updatedAt, ...safeBody } =
					req.body || {};

				if (!created && Object.keys(safeBody).length > 0) {
					await educationalBackground.update(safeBody);
				}

				return res.json({
					success: true,
					message: created
						? "Educational background created successfully."
						: "Educational background fetched successfully.",
					educationalBackground,
					created,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

    }

    postRouter() {}
}

module.exports = new EducationalBackgroundRouter().router;
