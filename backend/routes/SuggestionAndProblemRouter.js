// Author: JDM
// Created on: 2026-02-06T16:13:39.344Z

const express = require("express");
const { SuggestionAndProblem, User } = require("../models/Models");
const upload = require("../middlewares/UploadMiddleware");

class SuggestionAndProblemRouter {
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
					return res.status(400).json({
						success: false,
						message: "User authentication required.",
					});
				}

				const suggestions = await SuggestionAndProblem.findAll({
					where: { userId },
					order: [["createdAt", "DESC"]],
				});

				return res.json({
					success: true,
					message: "Successfully fetched all records.",
					suggestions,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/get/:id", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const { id } = req.params;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User authentication required.",
					});
				}

				const suggestion = await SuggestionAndProblem.findOne({
					where: { id, userId },
				});

				if (!suggestion) {
					return res.status(404).json({
						success: false,
						message: "Record not found.",
					});
				}

				return res.json({
					success: true,
					message: "Successfully fetched record.",
					suggestion,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});


		this.router.get("/admin/get-all", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const userRole = req.user?.role;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User authentication required.",
					});
				}

				const allowedRoles = ["MISD", "DEAN", "PRESIDENT"];
				if (!allowedRoles.includes(userRole)) {
					return res.status(403).json({
						success: false,
						message: "Unauthorized. Admin access required.",
					});
				}

				const suggestions = await SuggestionAndProblem.findAll({
					order: [
						["priority", "DESC"],
						["createdAt", "DESC"]
					],
				});

				// Fetch user details for each suggestion
				const suggestionsWithUser = await Promise.all(
					suggestions.map(async (suggestion) => {
						const suggestionData = suggestion.toJSON();
						if (suggestionData.userId) {
							const user = await User.findByPk(suggestionData.userId, {
								attributes: ["id", "firstName", "lastName", "email", "departmentId"],
							});
							suggestionData.User = user ? user.toJSON() : null;
						} else {
							suggestionData.User = null;
						}
						return suggestionData;
					})
				);

				return res.json({
					success: true,
					message: "Successfully fetched all records.",
					suggestions: suggestionsWithUser,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/admin/get-by-status/:status", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const userRole = req.user?.role;
				const { status } = req.params;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User authentication required.",
					});
				}

				const allowedRoles = ["MISD", "DEAN", "PRESIDENT"];
				if (!allowedRoles.includes(userRole)) {
					return res.status(403).json({
						success: false,
						message: "Unauthorized. Admin access required.",
					});
				}

				const validStatuses = ["PENDING", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"];
				if (!validStatuses.includes(status)) {
					return res.status(400).json({
						success: false,
						message: "Invalid status.",
					});
				}

				const suggestions = await SuggestionAndProblem.findAll({
					where: { status },
					order: [
						["priority", "DESC"],
						["createdAt", "DESC"]
					],
				});

				// Fetch user details for each suggestion
				const suggestionsWithUser = await Promise.all(
					suggestions.map(async (suggestion) => {
						const suggestionData = suggestion.toJSON();
						if (suggestionData.userId) {
							const user = await User.findByPk(suggestionData.userId, {
								attributes: ["id", "firstName", "lastName", "email", "departmentId"],
							});
							suggestionData.User = user ? user.toJSON() : null;
						} else {
							suggestionData.User = null;
						}
						return suggestionData;
					})
				);

				return res.json({
					success: true,
					message: `Successfully fetched ${status} records.`,
					suggestions: suggestionsWithUser,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/admin/get/:id", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const userRole = req.user?.role;
				const { id } = req.params;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User authentication required.",
					});
				}

				const allowedRoles = ["MISD", "DEAN", "PRESIDENT"];
				if (!allowedRoles.includes(userRole)) {
					return res.status(403).json({
						success: false,
						message: "Unauthorized. Admin access required.",
					});
				}

				const suggestion = await SuggestionAndProblem.findOne({
					where: { id },
				});

				if (!suggestion) {
					return res.status(404).json({
						success: false,
						message: "Record not found.",
					});
				}

				const suggestionData = suggestion.toJSON();

				// Fetch user details
				if (suggestionData.userId) {
					const user = await User.findByPk(suggestionData.userId, {
						attributes: ["id", "firstName", "lastName", "email", "departmentId"],
					});
					suggestionData.User = user ? user.toJSON() : null;
				} else {
					suggestionData.User = null;
				}

				return res.json({
					success: true,
					message: "Successfully fetched record.",
					suggestion: suggestionData,
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

	postRouter() {
		this.router.post("/create", upload.single("attachedFile"), async (req, res) => {
			try {
				const userId = req.user?.userId;
				const departmentId = req.user?.departmentId;

				const {
					type,
					category,
					subject,
					description,
					priority,
					isAnonymous,
				} = req.body;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User authentication required.",
					});
				}

				if (!type || !category || !subject || !description) {
					return res.status(400).json({
						success: false,
						message: "Type, category, subject, and description are required.",
					});
				}

				// Validate type
				if (!["SUGGESTION", "PROBLEM"].includes(type)) {
					return res.status(400).json({
						success: false,
						message: "Invalid type. Must be SUGGESTION or PROBLEM.",
					});
				}

				// Validate category
				const validCategories = [
					"FACILITIES",
					"ACADEMIC",
					"ADMINISTRATIVE",
					"TECHNOLOGY",
					"SAFETY",
					"HR",
					"OTHER"
				];
				if (!validCategories.includes(category)) {
					return res.status(400).json({
						success: false,
						message: "Invalid category.",
					});
				}

				// Validate priority if provided
				const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
				if (priority && !validPriorities.includes(priority)) {
					return res.status(400).json({
						success: false,
						message: "Invalid priority.",
					});
				}

				const suggestion = await SuggestionAndProblem.create({
					userId,
					departmentId: departmentId || null,
					type,
					category,
					subject,
					description,
					priority: priority || "MEDIUM",
					isAnonymous: isAnonymous === "true" || isAnonymous === true,
					attachedFile: req.file ? req.file.path : "",
				});

				return res.status(201).json({
					success: true,
					message: `${type === "SUGGESTION" ? "Suggestion" : "Problem"} submitted successfully.`,
					suggestion,
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

	putRouter() {
		this.router.put("/update/:id", upload.single("attachedFile"), async (req, res) => {
			try {
				const userId = req.user?.userId;
				const { id } = req.params;

				const {
					type,
					category,
					subject,
					description,
					priority,
					isAnonymous,
				} = req.body;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User authentication required.",
					});
				}

				const suggestion = await SuggestionAndProblem.findOne({
					where: { id, userId },
				});

				if (!suggestion) {
					return res.status(404).json({
						success: false,
						message: "Record not found or unauthorized.",
					});
				}

				// Don't allow editing if already reviewed or resolved
				if (["RESOLVED", "REJECTED", "IN_PROGRESS"].includes(suggestion.status)) {
					return res.status(400).json({
						success: false,
						message: "Cannot edit a record that is already being processed or resolved.",
					});
				}

				if (!type || !category || !subject || !description) {
					return res.status(400).json({
						success: false,
						message: "Type, category, subject, and description are required.",
					});
				}

				// Validate type
				if (!["SUGGESTION", "PROBLEM"].includes(type)) {
					return res.status(400).json({
						success: false,
						message: "Invalid type. Must be SUGGESTION or PROBLEM.",
					});
				}

				// Validate category
				const validCategories = [
					"FACILITIES",
					"ACADEMIC",
					"ADMINISTRATIVE",
					"TECHNOLOGY",
					"SAFETY",
					"HR",
					"OTHER"
				];
				if (!validCategories.includes(category)) {
					return res.status(400).json({
						success: false,
						message: "Invalid category.",
					});
				}

				// Validate priority if provided
				const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
				if (priority && !validPriorities.includes(priority)) {
					return res.status(400).json({
						success: false,
						message: "Invalid priority.",
					});
				}

				await suggestion.update({
					type,
					category,
					subject,
					description,
					priority: priority || suggestion.priority,
					isAnonymous: isAnonymous === "true" || isAnonymous === true,
					attachedFile: req.file ? req.file.path : suggestion.attachedFile,
				});

				return res.json({
					success: true,
					message: "Record updated successfully.",
					suggestion,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.delete("/delete/:id", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const { id } = req.params;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User authentication required.",
					});
				}

				const suggestion = await SuggestionAndProblem.findOne({
					where: { id, userId },
				});

				if (!suggestion) {
					return res.status(404).json({
						success: false,
						message: "Record not found or unauthorized.",
					});
				}

				// Don't allow deletion if already in progress or resolved
				if (["IN_PROGRESS", "RESOLVED"].includes(suggestion.status)) {
					return res.status(400).json({
						success: false,
						message: "Cannot delete a record that is being processed or already resolved.",
					});
				}

				await suggestion.destroy();

				return res.json({
					success: true,
					message: "Record deleted successfully.",
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.put("/admin/update-status/:id", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const userRole = req.user?.role;
				const { id } = req.params;

				const { status, adminResponse } = req.body;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User authentication required.",
					});
				}

				const allowedRoles = ["MISD", "DEAN", "PRESIDENT"];
				if (!allowedRoles.includes(userRole)) {
					return res.status(403).json({
						success: false,
						message: "Unauthorized. Admin access required.",
					});
				}

				const suggestion = await SuggestionAndProblem.findByPk(id);

				if (!suggestion) {
					return res.status(404).json({
						success: false,
						message: "Record not found.",
					});
				}

				const validStatuses = ["PENDING", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"];
				if (status && !validStatuses.includes(status)) {
					return res.status(400).json({
						success: false,
						message: "Invalid status.",
					});
				}

				const updates = {};

				if (status) {
					updates.status = status;

					if (suggestion.status === "PENDING" && status !== "PENDING") {
						updates.reviewedBy = userId;
						updates.reviewedAt = new Date();
					}

					if (["RESOLVED", "REJECTED"].includes(status) && !suggestion.resolvedAt) {
						updates.resolvedAt = new Date();
					}
				}

				if (adminResponse !== undefined) {
					updates.adminResponse = adminResponse;
				}

				await suggestion.update(updates);

				return res.json({
					success: true,
					message: "Status updated successfully.",
					suggestion,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.put("/admin/batch-update-status", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const userRole = req.user?.role;

				const { ids, status } = req.body;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User authentication required.",
					});
				}

				const allowedRoles = ["MISD", "DEAN", "PRESIDENT"];
				if (!allowedRoles.includes(userRole)) {
					return res.status(403).json({
						success: false,
						message: "Unauthorized. Admin access required.",
					});
				}

				if (!ids || !Array.isArray(ids) || ids.length === 0) {
					return res.status(400).json({
						success: false,
						message: "IDs array is required.",
					});
				}

				const validStatuses = ["PENDING", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"];
				if (!validStatuses.includes(status)) {
					return res.status(400).json({
						success: false,
						message: "Invalid status.",
					});
				}

				const updates = {
					status,
					reviewedBy: userId,
					reviewedAt: new Date(),
				};

				if (["RESOLVED", "REJECTED"].includes(status)) {
					updates.resolvedAt = new Date();
				}

				await SuggestionAndProblem.update(updates, {
					where: {
						id: ids,
					},
				});

				return res.json({
					success: true,
					message: `Successfully updated ${ids.length} record(s).`,
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

module.exports = new SuggestionAndProblemRouter().router;