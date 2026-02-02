// Author: JDM
// Created on: 2026-02-02T02:42:46.639Z

const express = require("express");
const { VoluntaryWork } = require("../models/Models");

class VoluntaryWorkRouter {
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

				const [voluntaryWork, created] =
					await VoluntaryWork.findOrCreate({
						where: { userId },
						defaults: {
							userId,
							...defaultData,
						},
					});

				const { id, userId: _userId, createdAt, updatedAt, ...safeBody } = req.body || {};

				if (!created && Object.keys(safeBody).length > 0) {
					await voluntaryWork.update(safeBody);
				}

				return res.json({
					success: true,
					message: created
						? "Voluntary work created successfully."
						: "Voluntary work fetched successfully.",
					voluntaryWork,
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

module.exports = new VoluntaryWorkRouter().router;
