// Author: JDM
// Created on: 2026-02-02T02:01:01.367Z

const express = require("express");
const { WorkExperience } = require("../models/Models");

class WorkExperienceRouter {
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
					experiences: [],
				};

				const [workExperience, created] =
					await WorkExperience.findOrCreate({
						where: { userId },
						defaults: {
							userId,
							...defaultData,
						},
					});

				const { id, userId: _userId, createdAt, updatedAt, ...safeBody } = req.body || {};

				if (!created && Object.keys(safeBody).length > 0) {
					await workExperience.update(safeBody);
				}

				return res.json({
					success: true,
					message: created
						? "Work experience created successfully."
						: "Work experience fetched successfully.",
					workExperience,
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

module.exports = new WorkExperienceRouter().router;
