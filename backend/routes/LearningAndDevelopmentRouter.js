// Author: JDM
// Created on: 2026-02-02T02:50:11.635Z

const express = require("express");
const { LearningAndDevelopment } = require("../models/Models");

class LearningAndDevelopmentRouter {
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
					trainings: [],
				};

				const [learningAndDevelopment, created] =
					await LearningAndDevelopment.findOrCreate({
						where: { userId },
						defaults: {
							userId,
							...defaultData,
						},
					});

				const { id, userId: _userId, createdAt, updatedAt, ...safeBody } = req.body || {};

				if (!created && Object.keys(safeBody).length > 0) {
					await learningAndDevelopment.update(safeBody);
				}

				return res.json({
					success: true,
					message: created
						? "Learning and development record created successfully."
						: "Learning and development record fetched successfully.",
					learningAndDevelopment,
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

module.exports = new LearningAndDevelopmentRouter().router;
