// routes/AccomplishmentRouter.js
const express = require("express");
const { sequelize, AccomplishmentReport, AccomplishmentEntry, User } = require("../models/Models");
const upload = require("../middlewares/UploadMiddleware");

class AccomplishmentRouter {
	constructor() {
		this.router = express.Router();
		this.getRouter();
		this.postRouter();
		this.putRouter();
		this.deleteRouter();
	}

	getRouter() {
		// GET /accomplishment/get - Get all accomplishments for authenticated user
		this.router.get("/get", async (req, res) => {
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

		// GET /accomplishment/get/:id - Get specific accomplishment by ID
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

				const enrichedEntries = await Promise.all(
					entries.map(async (entry) => {
						let signer = null;

						if (entry.signedBy) {
							signer = await User.findByPk(entry.signedBy, {
								attributes: ["id", "firstName", "lastName", "email", "role"],
							});
						}
						return {
							...entry.toJSON(),
							signedByUser: signer,
						};
					})
				);

				return res.json({
					success: true,
					report: {
						...report.toJSON(),
						entries: enrichedEntries,
					},
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({ success: false, message: "Internal server error." });
			}
		});

		// GET /accomplishment/count - Get total count of accomplishments
		this.router.get("/count", async (req, res) => {
			try {
				const userId = req.user?.userId;
				if (!userId) {
					return res.status(400).json({ success: false, message: "User id required." });
				}

				const count = await AccomplishmentReport.count({
					where: { userId }
				});

				return res.json({ success: true, count });
			} catch (err) {
				console.error(err);
				res.status(500).json({ success: false, message: "Internal server error." });
			}
		});

		// GET /accomplishment/stats - Get accomplishment statistics
		this.router.get("/stats", async (req, res) => {
			try {
				const userId = req.user?.userId;
				if (!userId) {
					return res.status(400).json({ success: false, message: "User id required." });
				}

				const total = await AccomplishmentReport.count({ where: { userId } });
				const pending = await AccomplishmentReport.count({
					where: { userId, status: "PENDING" }
				});
				const approvedByDean = await AccomplishmentReport.count({
					where: { userId, status: "APPROVED BY DEAN" }
				});
				const approvedByPresident = await AccomplishmentReport.count({
					where: { userId, status: "APPROVED BY PRESIDENT" }
				});
				const rejected = await AccomplishmentReport.count({
					where: { userId, status: "REJECTED" }
				});

				return res.json({
					success: true,
					stats: {
						total,
						pending,
						approvedByDean,
						approvedByPresident,
						rejected
					}
				});
			} catch (err) {
				console.error(err);
				res.status(500).json({ success: false, message: "Internal server error." });
			}
		});

		// GET /accomplishment/entry/get/:reportId - Get all entries for a report
		this.router.get("/entry/get/:reportId", async (req, res) => {
			try {
				const { reportId } = req.params;

				const entries = await AccomplishmentEntry.findAll({
					where: { reportId },
					order: [["date", "ASC"]],
				});

				const enrichedEntries = await Promise.all(
					entries.map(async (entry) => {
						let signer = null;
						if (entry.signedBy) {
							signer = await User.findByPk(entry.signedBy, {
								attributes: ["id", "firstName", "lastName", "email", "role"],
							});
						}
						return {
							...entry.toJSON(),
							signedByUser: signer,
						};
					})
				);

				return res.json({ success: true, entries: enrichedEntries });
			} catch (err) {
				console.error(err);
				res.status(500).json({ success: false, message: "Internal server error." });
			}
		});

		// Legacy routes (keep for backwards compatibility)
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
						const enrichedEntries = await Promise.all(
							entries.map(async (entry) => {
								let signer = null;

								if (entry.signedBy) {
									signer = await User.findByPk(entry.signedBy, {
										attributes: ["id", "firstName", "lastName", "email", "role"],
									});
								}
								return {
									...entry.toJSON(),
									signedByUser: signer,
								};
							})
						);
						return {
							...report.toJSON(),
							entries: enrichedEntries,
						};
					})
				);
				return res.json({ success: true, reports: reportsWithEntries });
			} catch (err) {
				console.error(err);
				res.status(500).json({ success: false, message: "Internal server error." });
			}
		});

		this.router.get("/get-all-higherup", async (req, res) => {
			try {
				const isDean = req.user?.role === "DEAN";
				const isPresident = req.user?.role === "PRESIDENT";
				const whereClause = {}
				if (isDean) {
					whereClause["isInDean"] = true;
				}
				if (isPresident) {
					whereClause["isInPresident"] = true;
				}
				const reports = await AccomplishmentReport.findAll({
					where: whereClause,
					order: [["createdAt", "DESC"]],
				});

				const reportsWithEntries = await Promise.all(
					reports.map(async (report) => {
						const entries = await AccomplishmentEntry.findAll({
							where: { reportId: report.id },
							order: [["date", "ASC"]],
						});
						const enrichedEntries = await Promise.all(
							entries.map(async (entry) => {
								let signer = null;

								if (entry.signedBy) {
									signer = await User.findByPk(entry.signedBy, {
										attributes: ["id", "firstName", "lastName", "email", "role"],
									});
								}
								return {
									...entry.toJSON(),
									signedByUser: signer,
								};
							})
						);
						return {
							...report.toJSON(),
							entries: enrichedEntries,
						};
					})
				);
				return res.json({ success: true, reports: reportsWithEntries });
			} catch (err) {
				console.error(err);
				res.status(500).json({ success: false, message: "Internal server error." });
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
		// POST /accomplishment/create - Create new accomplishment report
		this.router.post("/create", upload.single("uploadedUrl"), async (req, res) => {
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

		// POST /accomplishment/entry/create/:reportId - Add entry to report
		this.router.post("/entry/create/:reportId", async (req, res) => {
			try {
				const { reportId } = req.params;
				const { date, activities, remarks, signedBy } = req.body;

				if (!reportId || !date || !Array.isArray(activities)) {
					return res.status(400).json({
						success: false,
						message: "reportId, date, and activities required."
					});
				}

				const entry = await AccomplishmentEntry.create({
					reportId,
					date,
					activities,
					remarks: remarks || null,
					signedBy: signedBy || null
				});

				return res.status(201).json({ success: true, entry });
			} catch (err) {
				console.error(err);
				res.status(500).json({ success: false, message: "Internal server error." });
			}
		});

		// Legacy route
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
		// PUT /accomplishment/update/:id - Update accomplishment report
		this.router.put("/update/:id", upload.single("uploadedUrl"), async (req, res) => {
			try {
				const { id } = req.params;
				const userId = req.user?.userId;
				const { remarks } = req.body;

				if (!userId) {
					return res.status(401).json({ success: false, message: "Unauthorized." });
				}

				const report = await AccomplishmentReport.findOne({
					where: { id, userId }
				});

				if (!report) {
					return res.status(404).json({ success: false, message: "Report not found." });
				}

				if (report.status !== "PENDING") {
					return res.status(400).json({
						success: false,
						message: "Cannot update report that is not in PENDING status."
					});
				}

				const updateData = {
					remarks: remarks || report.remarks
				};

				// Only update uploadedUrl if a new file is provided
				if (req.file) {
					updateData.uploadedUrl = req.file.path;
				}

				await AccomplishmentReport.update(updateData, {
					where: { id }
				});

				const updatedReport = await AccomplishmentReport.findByPk(id);

				return res.json({
					success: true,
					message: "Report updated successfully.",
					report: updatedReport
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({ success: false, message: "Internal server error." });
			}
		});

		// PUT /accomplishment/entry/update/:reportId/:entryId - Update specific entry
		this.router.put("/entry/update/:reportId/:entryId", async (req, res) => {
			try {
				const { reportId, entryId } = req.params;
				const { date, activities, remarks, signedBy } = req.body;

				const entry = await AccomplishmentEntry.findOne({
					where: { id: entryId, reportId }
				});

				if (!entry) {
					return res.status(404).json({
						success: false,
						message: "Entry not found."
					});
				}

				const updateData = {};
				if (date) updateData.date = date;
				if (activities) updateData.activities = activities;
				if (remarks !== undefined) updateData.remarks = remarks;
				if (signedBy !== undefined) updateData.signedBy = signedBy;

				await AccomplishmentEntry.update(updateData, {
					where: { id: entryId }
				});

				const updatedEntry = await AccomplishmentEntry.findByPk(entryId);

				return res.json({
					success: true,
					message: "Entry updated successfully.",
					entry: updatedEntry
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({ success: false, message: "Internal server error." });
			}
		});

		// Legacy routes
		this.router.put("/update-status/:id", async (req, res) => {
			try {
				const { id } = req.params;
				const { status, remarks } = req.body;

				const role = req.user?.role;
				const isDean = role === "DEAN";
				const isPresident = role === "PRESIDENT";

				if (!isDean && !isPresident) {
					return res.status(403).json({
						success: false,
						message: "Unauthorized action.",
					});
				}
				const report = await AccomplishmentReport.findByPk(id);
				if (!report) {
					return res.status(404).json({
						success: false,
						message: "Accomplishment report not found.",
					});
				}
				let updatePayload = {
					status,
					remarks: remarks ?? report.remarks,
				};
				if (isDean && status === "APPROVED BY DEAN") {
					updatePayload.isHaveDeanSignature = true;
					updatePayload.isInPresident = true;
				}
				if (isPresident && status === "APPROVED BY PRESIDENT") {
					updatePayload.isHavePresidentSignature = true;
				}
				await AccomplishmentReport.update(updatePayload, {
					where: { id },
				});

				return res.json({
					success: true,
					message: "Accomplishment report status updated successfully.",
					status,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.put("/sign-entry/:entryId", async (req, res) => {
			try {
				const { entryId } = req.params;
				const { remarks } = req.body;
				const signedBy = req.user?.userId;

				if (!signedBy) {
					return res.status(401).json({
						success: false,
						message: "Unauthorized",
					});
				}
				const entry = await AccomplishmentEntry.findByPk(entryId);
				if (!entry) {
					return res.status(404).json({
						success: false,
						message: "Entry not found",
					});
				}
				const record = await AccomplishmentReport.findByPk(entry.reportId);
				if (!record) {
					return res.status(404).json({
						success: false,
						message: "Record not found",
					});
				}
				await AccomplishmentEntry.update(
					{
						remarks: remarks ?? entry.remarks,
						signedBy,
					},
					{ where: { id: entryId } }
				);

				const allEntries = await AccomplishmentEntry.findAll({
					where: { reportId: entry.reportId },
				});

				const allSigned = allEntries.every((e) => e.signedBy);
				if (allSigned && !record.isInDean) {
					await AccomplishmentReport.update(
						{ isInDean: true },
						{ where: { id: record.id } }
					);
				}
				return res.json({
					success: true,
					message: "Entry signed successfully.",
					isInDean: allSigned,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error",
				});
			}
		});
	}

	deleteRouter() {
		// DELETE /accomplishment/delete/:id - Delete accomplishment report
		this.router.delete("/delete/:id", async (req, res) => {
			const t = await sequelize.transaction();
			try {
				const { id } = req.params;
				const userId = req.user?.userId;

				if (!userId) {
					return res.status(401).json({ success: false, message: "Unauthorized." });
				}

				const report = await AccomplishmentReport.findOne({
					where: { id, userId }
				});

				if (!report) {
					return res.status(404).json({
						success: false,
						message: "Report not found."
					});
				}

				if (report.status !== "PENDING") {
					return res.status(400).json({
						success: false,
						message: "Cannot delete report that is not in PENDING status."
					});
				}

				// Delete all entries first
				await AccomplishmentEntry.destroy({
					where: { reportId: id },
					transaction: t
				});

				// Delete the report
				await AccomplishmentReport.destroy({
					where: { id },
					transaction: t
				});

				await t.commit();

				return res.json({
					success: true,
					message: "Report and all associated entries deleted successfully."
				});
			} catch (err) {
				await t.rollback();
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error."
				});
			}
		});

		// DELETE /accomplishment/entry/delete/:reportId/:entryId - Delete specific entry
		this.router.delete("/entry/delete/:reportId/:entryId", async (req, res) => {
			try {
				const { reportId, entryId } = req.params;

				const entry = await AccomplishmentEntry.findOne({
					where: { id: entryId, reportId }
				});

				if (!entry) {
					return res.status(404).json({
						success: false,
						message: "Entry not found."
					});
				}

				await AccomplishmentEntry.destroy({
					where: { id: entryId }
				});

				return res.json({
					success: true,
					message: "Entry deleted successfully."
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error."
				});
			}
		});
	}
}

module.exports = new AccomplishmentRouter().router;