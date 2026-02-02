// Author: JDM
// Created on: 2026-02-01T23:33:00.276Z

const express = require("express");
const { PersonalInformation } = require("../models/Models");

class PersonalInformationRouter {
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
					surname: "",
					firstName: "",
					dateOfBirth: "1900-01-01",
					placeOfBirth: "",
					sex: "Male",
					civilStatus: "Single",
					citizenship: "Filipino",
					mobileNo: "",
				};

				const [personalinformation, created] =
					await PersonalInformation.findOrCreate({
						where: { userId },
						defaults: {
							userId,
							...defaultData,
						},
					});

				const {
					id,
					userId: _userId,
					createdAt,
					updatedAt,
					...safeBody
				} = req.body || {};

				if (!created && Object.keys(safeBody).length > 0) {
					await PersonalInformation.update(safeBody, { where: { userId } });
				}

				return res.json({
					success: true,
					message: created
						? "Personal information created successfully."
						: "Personal information fetched successfully.",
					personalinformation,
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

	postRouter() { }
}

module.exports = new PersonalInformationRouter().router;
