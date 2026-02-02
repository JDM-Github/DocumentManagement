// Author: JDM
// Created on: 2026-02-02T01:28:06.592Z

const express = require("express");
const { FamilyBackground } = require("../models/Models");

class FamilyBackgroundRouter {
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
					spouseSurname: "",
					spouseFirstName: "",
					spouseMiddleName: "",
					spouseNameExtension: "",
					spouseOccupation: "",
					employerBusinessName: "",
					businessAddress: "",
					spouseTelephoneNo: "",

					fatherSurname: "",
					fatherFirstName: "",
					fatherMiddleName: "",
					fatherNameExtension: "",

					motherMaidenName: "",
					motherSurname: "",
					motherFirstName: "",
					motherMiddleName: "",

					children: [],
				};

				const [familyBackground, created] =
					await FamilyBackground.findOrCreate({
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
					await familyBackground.update(safeBody);
				}

				return res.json({
					success: true,
					message: created
						? "Family background created successfully."
						: "Family background fetched successfully.",
					familyBackground,
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

module.exports = new FamilyBackgroundRouter().router;
