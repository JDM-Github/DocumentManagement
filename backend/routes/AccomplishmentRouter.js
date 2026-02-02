// routes/AccomplishmentRouter.js
const express = require("express");
const { sequelize, AccomplishmentReport, AccomplishmentEntry } = require("../models/Models");
const upload = require("../middlewares/UploadMiddleware");

class AccomplishmentRouter {
	constructor() {
		this.router = express.Router();
		this.getRouter();
		this.postRouter();
		this.putRouter();
	}

	getRouter() {
		this.router.get("/get-all", async (req, res) => {
			try {
				const userId = req.user?.userId;
				if (!userId) {
					return res.status(400).json({ success: false, message: "User id required." });
				}

				const reports = await AccomplishmentReport.findAll({
					where: { userId },
					order: [["createdAt", "DESC"]],
				});
				const reportsWithEntries = await Promise.all(
					reports.map(async (report) => {
						const entries = await AccomplishmentEntry.findAll({
							where: { reportId: report.id },
							order: [["date", "ASC"]],
						});

						return {
							...report.toJSON(),
							entries, 
						};
					})
				);
				return res.json({ success: true, reports: reportsWithEntries });
			} catch (err) {
				console.error(err);
				res.status(500).json({ success: false, message: "Internal server error." });
			}
		});
		this.router.get("/get-all-department", async (req, res) => {
			try {
				const departmentId = req.user?.departmentId;
				if (!departmentId) {
					return res.status(400).json({ success: false, message: "Department id is required." });
				}
				const reports = await AccomplishmentReport.findAll({
					where: { departmentId },
					order: [["createdAt", "DESC"]],
				});
				const reportsWithEntries = await Promise.all(
					reports.map(async (report) => {
						const entries = await AccomplishmentEntry.findAll({
							where: { reportId: report.id },
							order: [["date", "ASC"]],
						});

						return {
							...report.toJSON(),
							entries,
						};
					})
				);
				return res.json({ success: true, reports: reportsWithEntries });
			} catch (err) {
				console.error(err);
				res.status(500).json({ success: false, message: "Internal server error." });
			}
		});
		this.router.get("/get/:id", async (req, res) => {
			try {
				const { id } = req.params;
				if (!id) return res.status(400).json({ success: false, message: "Report ID is required." });

				const report = await AccomplishmentReport.findOne({
					where: { id },
				});

				if (!report) {
					return res.status(404).json({ success: false, message: "Report not found." });
				}

				const entries = await AccomplishmentEntry.findAll({
					where: { reportId: id },
					order: [["date", "ASC"]],
				});

				return res.json({
					success: true,
					report: {
						...report.toJSON(),
						entries: entries.map(e => e.toJSON()),
					},
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({ success: false, message: "Internal server error." });
			}
		});



		this.router.get("/entries/:reportId", async (req, res) => {
			try {
				const { reportId } = req.params;
				const entries = await AccomplishmentEntry.findAll({
					where: { reportId },
					order: [["date", "ASC"]],
				});
				return res.json({ success: true, entries });
			} catch (err) {
				console.error(err);
				res.status(500).json({ success: false, message: "Internal server error." });
			}
		});
	}

	postRouter() {
		this.router.post("/create-report", upload.single("uploadedUrl"), async (req, res) => {
			const t = await sequelize.transaction();
			try {
				const userId = req.user?.userId;
				const departmentId = req.user?.departmentId;
				const { remarks, entries } = req.body;

				if (!userId || !departmentId || !req.file) {
					return res.status(400).json({
						success: false,
						message: "userId, departmentId and PDF file are required.",
					});
				}

				if (!entries) {
					return res.status(400).json({
						success: false,
						message: "Entries are required.",
					});
				}

				let parsedEntries;
				try {
					parsedEntries = JSON.parse(entries);
					if (!Array.isArray(parsedEntries) || parsedEntries.length === 0) {
						throw new Error("Entries must be a non-empty array");
					}
				} catch (err) {
					return res.status(400).json({ success: false, message: "Invalid entries format" });
				}

				const report = await AccomplishmentReport.create(
					{
						userId,
						uploadedUrl: req.file.path,
						departmentId,
						remarks: remarks || null,
					},
					{ transaction: t }
				);

				const entryPromises = parsedEntries.map((entry) =>
					AccomplishmentEntry.create(
						{
							reportId: report.id,
							date: entry.date,
							activities: entry.activities,
							remarks: entry.remarks || null,
						},
						{ transaction: t }
					)
				);

				await Promise.all(entryPromises);
				await t.commit();

				return res.status(201).json({ success: true, report });
			} catch (err) {
				await t.rollback();
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.post("/create-entry", async (req, res) => {
			try {
				const { reportId, date, activities } = req.body;
				if (!reportId || !date || !Array.isArray(activities)) {
					return res.status(400).json({ success: false, message: "reportId, date, and activities required." });
				}

				const entry = await AccomplishmentEntry.create({ reportId, date, activities });
				return res.status(201).json({ success: true, entry });
			} catch (err) {
				console.error(err);
				res.status(500).json({ success: false, message: "Internal server error." });
			}
		});
	}

	putRouter() {
		this.router.put("/sign-entry/:entryId", async (req, res) => {
			try {
				const { entryId } = req.params;
				const { remarks } = req.body;
				const signedBy = req.user?.userId;

				if (!signedBy) {
					return res.status(401).json({ success: false, message: "Unauthorized" });
				}

				const entry = await AccomplishmentEntry.findByPk(entryId);
				if (!entry) {
					return res.status(404).json({ success: false, message: "Entry not found" });
				}

				await entry.update({
					remarks: remarks || entry.remarks,
					signedBy,
				});

				return res.json({ success: true, entry });
			} catch (err) {
				console.error(err);
				return res.status(500).json({ success: false, message: "Internal server error" });
			}
		});

	}
}

module.exports = new AccomplishmentRouter().router;
