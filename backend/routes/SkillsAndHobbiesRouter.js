// Author: JDM
// Created on: 2026-02-02T02:54:27.541Z

const express = require("express");
const { SkillsAndHobbies } = require("../models/Models");

class SkillsAndHobbiesRouter {
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
					entries: [],
				};

				const [skillsAndHobbies, created] =
					await SkillsAndHobbies.findOrCreate({
						where: { userId },
						defaults: {
							userId,
							...defaultData,
						},
					});

				const { id, userId: _userId, createdAt, updatedAt, ...safeBody } = req.body || {};

				if (!created && Object.keys(safeBody).length > 0) {
					await skillsAndHobbies.update(safeBody);
				}

				return res.json({
					success: true,
					message: created
						? "Skills and hobbies created successfully."
						: "Skills and hobbies fetched successfully.",
					skillsAndHobbies,
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

module.exports = new SkillsAndHobbiesRouter().router;
