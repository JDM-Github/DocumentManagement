// Author: JDM
// Created on: 2026-02-02T02:59:13.040Z

const express = require("express");
const { OtherInformation } = require("../models/Models");

class OtherInformationRouter {
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
					details: {},
				};

				const [otherInformation, created] =
					await OtherInformation.findOrCreate({
						where: { userId },
						defaults: {
							userId,
							...defaultData,
						},
					});

				const { id, userId: _userId, createdAt, updatedAt, ...safeBody } = req.body || {};

				if (!created && Object.keys(safeBody).length > 0) {
					await OtherInformation.update(safeBody, {
						where: { userId }
					});
				}

				console.log(otherInformation);

				return res.json({
					success: true,
					message: created
						? "Other information created successfully."
						: "Other information fetched successfully.",
					otherInformation,
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

module.exports = new OtherInformationRouter().router;
