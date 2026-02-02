// Author: JDM
// Created on: 2026-01-24T11:13:41.583Z

const express = require("express");
const { RequestLetterLog } = require("../models/Models");

class RequestLetterLogRouter {
	constructor() {
		this.router = express.Router();
		this.getRouter();
	}

	// =========================
	// GET ROUTES
	// =========================
	getRouter() {
		// Get all logs (admin / debug use)
		this.router.get("/get-all", async (req, res) => {
			try {
				const logs = await RequestLetterLog.findAll({
					order: [["createdAt", "DESC"]],
				});

				return res.json({
					success: true,
					message: "Successfully fetched all request letter logs.",
					logs,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		// Get logs by request letter ID (timeline)
		this.router.get("/by-request/:requestLetterId", async (req, res) => {
			try {
				const logs = await RequestLetterLog.findAll({
					where: { requestLetterId: req.params.requestLetterId },
					order: [["createdAt", "ASC"]],
				});

				return res.json({
					success: true,
					logs,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		// Get logs acted by a user (optional, audit view)
		this.router.get("/by-user/:userId", async (req, res) => {
			try {
				const logs = await RequestLetterLog.findAll({
					where: { actedBy: req.params.userId },
					order: [["createdAt", "DESC"]],
				});

				return res.json({
					success: true,
					logs,
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
}

module.exports = new RequestLetterLogRouter().router;
