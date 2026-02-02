// Author: JDM
// Created on: 2026-02-02T01:53:57.785Z

const express = require("express");
const { CivilServiceEligibility } = require("../models/Models");

class CivilServiceEligibilityRouter {
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
					eligibilities: [],
				};

				const [civilServiceEligibility, created] =
					await CivilServiceEligibility.findOrCreate({
						where: { userId },
						defaults: {
							userId,
							...defaultData,
						},
					});

				const { id, userId: _userId, createdAt, updatedAt, ...safeBody } = req.body || {};

				if (!created && Object.keys(safeBody).length > 0) {
					await civilServiceEligibility.update(safeBody);
				}

				return res.json({
					success: true,
					message: created
						? "Civil service eligibility created successfully."
						: "Civil service eligibility fetched successfully.",
					civilServiceEligibility,
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

module.exports = new CivilServiceEligibilityRouter().router;
