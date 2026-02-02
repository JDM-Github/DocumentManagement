// Author: JDM
// Created on: 2026-02-02T03:05:45.935Z

const express = require("express");
const { Reference } = require("../models/Models");

class ReferenceRouter {
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
					references: [],
				};

				const [reference, created] =
					await Reference.findOrCreate({
						where: { userId },
						defaults: {
							userId,
							...defaultData,
						},
					});

				const { id, userId: _userId, createdAt, updatedAt, ...safeBody } = req.body || {};

				if (!created && Object.keys(safeBody).length > 0) {
					await reference.update(safeBody);
				}

				return res.json({
					success: true,
					message: created
						? "Reference created successfully."
						: "Reference fetched successfully.",
					reference,
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

module.exports = new ReferenceRouter().router;
