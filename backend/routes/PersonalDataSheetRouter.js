// Author: JDM
// Created on: 2026-02-02T04:41:10.120Z

const express = require("express");
const { PersonalInformation, FamilyBackground, EducationalBackground, CivilServiceEligibility, WorkExperience, VoluntaryWork, LearningAndDevelopment, SkillsAndHobbies, OtherInformation, Reference } = require("../models/Models");

class PersonalDataSheetRouter {
	constructor() {
		this.router = express.Router();
		this.getRouter();
		this.postRouter();
	}

	getRouter() {
		this.router.get("/get", async (req, res) => {
			try {
				const userId = req.user?.userId;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User ID is required",
					});
				}

				const [
					personalInformation,
					familyBackground,
					educationalBackground,
					civilServiceEligibility,
					workExperience,
					voluntaryWork,
					learningAndDevelopment,
					skillsAndHobbies,
					otherInformation,
					references,
				] = await Promise.all([
					PersonalInformation.findOne({ where: { userId } }),
					FamilyBackground.findOne({ where: { userId } }),
					EducationalBackground.findOne({ where: { userId } }),
					CivilServiceEligibility.findOne({ where: { userId } }),
					WorkExperience.findOne({ where: { userId } }),
					VoluntaryWork.findOne({ where: { userId } }),
					LearningAndDevelopment.findOne({ where: { userId } }),
					SkillsAndHobbies.findOne({ where: { userId } }),
					OtherInformation.findOne({ where: { userId } }),
					Reference.findOne({ where: { userId } }),
				]);

				return res.json({
					success: true,
					data: {
						personalInformation,
						familyBackground,
						educationalBackground,
						civilServiceEligibility,
						workExperience,
						voluntaryWork,
						learningAndDevelopment,
						skillsAndHobbies,
						otherInformation,
						references,
					},
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

	postRouter() { }
}

module.exports = new PersonalDataSheetRouter().router;
