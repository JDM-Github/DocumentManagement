// Author: JDM
// Created on: 2026-02-05T13:31:13.277Z

const express = require("express");
const { FacultyEvaluation, User } = require("../models/Models");
const crypto = require("crypto");

class FacultyEvaluationRouter {
	constructor() {
		this.router = express.Router();
		this.getRouter();
		this.postRouter();
		this.putRouter();
		this.deleteRouter();
	}

	getRouter() {
		this.router.get("/get-all", async (req, res) => {
			try {
				const facultyevaluations = await FacultyEvaluation.findAll({
					order: [["createdAt", "DESC"]]
				});

				const evaluationsWithUsers = await Promise.all(
					facultyevaluations.map(async (evaluation) => {
						const faculty = await User.findByPk(evaluation.facultyId, {
							attributes: ["id", "firstName", "lastName", "email", "departmentId"]
						});
						const evaluator = await User.findByPk(evaluation.evaluatorId, {
							attributes: ["id", "firstName", "lastName"]
						});

						return {
							...evaluation.toJSON(),
							faculty,
							evaluator
						};
					})
				);

				return res.json({
					success: true,
					message: "Successfully fetched all faculty evaluations.",
					facultyevaluations: evaluationsWithUsers,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/faculty/:facultyId", async (req, res) => {
			try {
				const { facultyId } = req.params;
				const { userId } = req.query;

				const currentUser = await User.findByPk(userId);
				if (!currentUser) {
					return res.status(404).json({
						success: false,
						message: "User not found.",
					});
				}

				const faculty = await User.findByPk(facultyId);
				if (!faculty) {
					return res.status(404).json({
						success: false,
						message: "Faculty not found.",
					});
				}

				if (currentUser.departmentId !== faculty.departmentId) {
					return res.status(403).json({
						success: false,
						message: "Access denied. Different department.",
					});
				}

				const evaluations = await FacultyEvaluation.findAll({
					where: {
						facultyId,
						departmentId: currentUser.departmentId
					},
					order: [["createdAt", "DESC"]]
				});

				const evaluationsWithEvaluators = await Promise.all(
					evaluations.map(async (evaluation) => {
						const evaluator = await User.findByPk(evaluation.evaluatorId, {
							attributes: ["id", "firstName", "lastName"]
						});

						return {
							...evaluation.toJSON(),
							evaluator
						};
					})
				);

				return res.json({
					success: true,
					message: "Successfully fetched evaluations.",
					evaluations: evaluationsWithEvaluators,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/code/:uniqueCode", async (req, res) => {
			try {
				const { uniqueCode } = req.params;

				const evaluation = await FacultyEvaluation.findOne({
					where: { uniqueCode }
				});

				if (!evaluation) {
					return res.status(404).json({
						success: false,
						message: "Evaluation not found.",
					});
				}

				// Manually fetch faculty data
				const faculty = await User.findByPk(evaluation.facultyId, {
					attributes: ["id", "firstName", "lastName", "departmentId"]
				});

				return res.json({
					success: true,
					message: "Evaluation found.",
					evaluation: {
						...evaluation.toJSON(),
						faculty
					},
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/my-evaluations/:userId", async (req, res) => {
			try {
				const { userId } = req.params;

				const evaluations = await FacultyEvaluation.findAll({
					where: { evaluatorId: userId },
					order: [["createdAt", "DESC"]]
				});

				const evaluationsWithFaculty = await Promise.all(
					evaluations.map(async (evaluation) => {
						const faculty = await User.findByPk(evaluation.facultyId, {
							attributes: ["id", "firstName", "lastName", "email"]
						});

						return {
							...evaluation.toJSON(),
							faculty
						};
					})
				);

				return res.json({
					success: true,
					message: "Successfully fetched your evaluations.",
					evaluations: evaluationsWithFaculty,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/get-my-evaluations", async (req, res) => {
			try {
				const evaluatorId = req.user?.userId;

				if (!evaluatorId) {
					return res.status(401).json({
						success: false,
						message: "Unauthorized.",
					});
				}

				const evaluations = await FacultyEvaluation.findAll({
					where: { evaluatorId },
					order: [
						["academicPeriod", "DESC"],
						["createdAt", "DESC"]
					]
				});

				const facultyIds = [...new Set(evaluations.map(e => e.facultyId))];
				const facultyMembers = await User.findAll({
					where: { id: facultyIds },
					attributes: ["id", "firstName", "lastName", "email"]
				});

				const facultyMap = {};
				facultyMembers.forEach(faculty => {
					facultyMap[faculty.id] = faculty;
				});

				const evaluationsWithFaculty = evaluations.map(eval2 => ({
					...eval2.toJSON(),
					faculty: facultyMap[eval2.facultyId] || null
				}));

				return res.json({
					success: true,
					evaluations: evaluationsWithFaculty,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});
		this.router.get("/get-by-period/:academicPeriod", async (req, res) => {
			try {
				const { academicPeriod } = req.params;
				const evaluatorId = req.user?.userId;

				if (!evaluatorId) {
					return res.status(401).json({
						success: false,
						message: "Unauthorized.",
					});
				}

				const evaluations = await FacultyEvaluation.findAll({
					where: {
						evaluatorId,
						academicPeriod
					},
					order: [["createdAt", "DESC"]]
				});

				const facultyIds = [...new Set(evaluations.map(e => e.facultyId))];
				const facultyMembers = await User.findAll({
					where: { id: facultyIds },
					attributes: ["id", "firstName", "lastName", "email"]
				});

				const facultyMap = {};
				facultyMembers.forEach(faculty => {
					facultyMap[faculty.id] = faculty;
				});

				const evaluationsWithFaculty = evaluations.map(eval2 => ({
					...eval2.toJSON(),
					faculty: facultyMap[eval2.facultyId] || null
				}));

				return res.json({
					success: true,
					evaluations: evaluationsWithFaculty,
					academicPeriod,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});
		this.router.get("/get-stats", async (req, res) => {
			try {
				const evaluatorId = req.user?.userId;

				if (!evaluatorId) {
					return res.status(401).json({
						success: false,
						message: "Unauthorized.",
					});
				}

				const evaluations = await FacultyEvaluation.findAll({
					where: { evaluatorId, status: "ACTIVE" },
					attributes: ["rating", "academicPeriod"]
				});

				const totalEvaluations = evaluations.length;
				const averageRating = evaluations.length > 0
					? evaluations.reduce((sum, eval2) => sum + eval2.rating, 0) / evaluations.length
					: 0;

				const byPeriod = evaluations.reduce((acc, eval2) => {
					const period = eval2.academicPeriod;
					if (!acc[period]) {
						acc[period] = { count: 0, totalRating: 0 };
					}
					acc[period].count++;
					acc[period].totalRating += eval2.rating;
					return acc;
				}, {});

				const periodStats = Object.entries(byPeriod).map(([period, stats]) => ({
					academicPeriod: period,
					count: stats.count,
					averageRating: stats.totalRating / stats.count
				}));

				return res.json({
					success: true,
					stats: {
						totalEvaluations,
						averageRating: Math.round(averageRating * 100) / 100,
						byPeriod: periodStats
					}
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});
		// Get all evaluations received by the current user (ANONYMOUS - no evaluator info)
		this.router.get("/get-received", async (req, res) => {
			try {
				const facultyId = req.user?.userId;

				if (!facultyId) {
					return res.status(401).json({
						success: false,
						message: "Unauthorized.",
					});
				}

				const evaluations = await FacultyEvaluation.findAll({
					where: {
						facultyId,
						status: "ACTIVE" // Only show active evaluations
					},
					attributes: [
						"id",
						"message",
						"rating",
						"uniqueCode",
						"academicPeriod",
						"status",
						"createdAt",
						"updatedAt"
						// IMPORTANT: Do NOT include evaluatorId to keep it anonymous
					],
					order: [
						["academicPeriod", "DESC"],
						["createdAt", "DESC"]
					]
				});

				const totalEvaluations = evaluations.length;
				const averageRating = totalEvaluations > 0
					? evaluations.reduce((sum, eval2) => sum + eval2.rating, 0) / totalEvaluations
					: 0;

				const ratingDistribution = {
					1: evaluations.filter(e => e.rating === 1).length,
					2: evaluations.filter(e => e.rating === 2).length,
					3: evaluations.filter(e => e.rating === 3).length,
					4: evaluations.filter(e => e.rating === 4).length,
				};

				const byPeriod = evaluations.reduce((acc, eval2) => {
					const period = eval2.academicPeriod;
					if (!acc[period]) {
						acc[period] = { count: 0, totalRating: 0, ratings: [] };
					}
					acc[period].count++;
					acc[period].totalRating += eval2.rating;
					acc[period].ratings.push(eval2.rating);
					return acc;
				}, {});

				const periodStats = Object.entries(byPeriod).map(([period, stats]) => ({
					academicPeriod: period,
					count: stats.count,
					averageRating: stats.totalRating / stats.count,
					ratings: stats.ratings
				}));

				return res.json({
					success: true,
					evaluations,
					stats: {
						totalEvaluations,
						averageRating: Math.round(averageRating * 100) / 100,
						ratingDistribution,
						byPeriod: periodStats
					}
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		// Get received evaluations by academic period (ANONYMOUS)
		this.router.get("/get-received-by-period/:academicPeriod", async (req, res) => {
			try {
				const { academicPeriod } = req.params;
				const facultyId = req.user?.userId;

				if (!facultyId) {
					return res.status(401).json({
						success: false,
						message: "Unauthorized.",
					});
				}

				const evaluations = await FacultyEvaluation.findAll({
					where: {
						facultyId,
						academicPeriod,
						status: "ACTIVE"
					},
					attributes: [
						"id",
						"message",
						"rating",
						"uniqueCode",
						"academicPeriod",
						"status",
						"createdAt",
						"updatedAt"
						// IMPORTANT: Do NOT include evaluatorId to keep it anonymous
					],
					order: [["createdAt", "DESC"]]
				});

				const totalEvaluations = evaluations.length;
				const averageRating = totalEvaluations > 0
					? evaluations.reduce((sum, eval2) => sum + eval2.rating, 0) / totalEvaluations
					: 0;

				return res.json({
					success: true,
					evaluations,
					academicPeriod,
					stats: {
						totalEvaluations,
						averageRating: Math.round(averageRating * 100) / 100
					}
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		// Get statistics summary for received evaluations
		this.router.get("/get-received-stats", async (req, res) => {
			try {
				const facultyId = req.user?.userId;

				if (!facultyId) {
					return res.status(401).json({
						success: false,
						message: "Unauthorized.",
					});
				}

				const evaluations = await FacultyEvaluation.findAll({
					where: {
						facultyId,
						status: "ACTIVE"
					},
					attributes: ["rating", "academicPeriod", "createdAt"]
				});

				const totalEvaluations = evaluations.length;
				const averageRating = totalEvaluations > 0
					? evaluations.reduce((sum, eval2) => sum + eval2.rating, 0) / totalEvaluations
					: 0;

				const ratingDistribution = {
					1: evaluations.filter(e => e.rating === 1).length,
					2: evaluations.filter(e => e.rating === 2).length,
					3: evaluations.filter(e => e.rating === 3).length,
					4: evaluations.filter(e => e.rating === 4).length,
				};

				const periods = [...new Set(evaluations.map(e => e.academicPeriod))].sort().reverse();
				const latestPeriod = periods[0] || null;

				let trend = null;
				if (periods.length >= 2) {
					const latestEvals = evaluations.filter(e => e.academicPeriod === periods[0]);
					const previousEvals = evaluations.filter(e => e.academicPeriod === periods[1]);

					const latestAvg = latestEvals.reduce((sum, e) => sum + e.rating, 0) / latestEvals.length;
					const previousAvg = previousEvals.reduce((sum, e) => sum + e.rating, 0) / previousEvals.length;

					trend = {
						current: Math.round(latestAvg * 100) / 100,
						previous: Math.round(previousAvg * 100) / 100,
						change: Math.round((latestAvg - previousAvg) * 100) / 100,
						improving: latestAvg > previousAvg
					};
				}

				return res.json({
					success: true,
					stats: {
						totalEvaluations,
						averageRating: Math.round(averageRating * 100) / 100,
						ratingDistribution,
						latestPeriod,
						trend
					}
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
		this.router.post("/create", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const { facultyId, message, rating } = req.body;

				if (!facultyId || !message || !rating || !userId) {
					return res.status(400).json({
						success: false,
						message: "Missing required fields.",
					});
				}

				if (rating < 1 || rating > 4) {
					return res.status(400).json({
						success: false,
						message: "Rating must be between 1 and 4.",
					});
				}

				const faculty = await User.findByPk(facultyId);
				const evaluator = await User.findByPk(userId);

				if (!faculty || !evaluator) {
					return res.status(404).json({
						success: false,
						message: "Faculty or evaluator not found.",
					});
				}

				if (faculty.departmentId !== evaluator.departmentId) {
					return res.status(403).json({
						success: false,
						message: "Can only evaluate faculty in same department.",
					});
				}

				// Generate academic period automatically (e.g., "2025-2026")
				const currentDate = new Date();
				const currentYear = currentDate.getFullYear();
				const currentMonth = currentDate.getMonth() + 1; // 0-indexed

				// Academic year typically starts in August/September
				// If current month is Jan-July, we're in the latter part of academic year
				// If current month is Aug-Dec, we're in the first part of academic year
				const academicPeriod = currentMonth >= 8
					? `${currentYear}-${currentYear + 1}`
					: `${currentYear - 1}-${currentYear}`;

				// Check if evaluator already evaluated this faculty in current academic year
				const existingEvaluation = await FacultyEvaluation.findOne({
					where: {
						facultyId,
						evaluatorId: userId,
						academicPeriod
					}
				});

				if (existingEvaluation) {
					return res.status(409).json({
						success: false,
						message: `You have already evaluated this faculty member for academic year ${academicPeriod}.`,
					});
				}

				const uniqueCode = crypto.randomBytes(8).toString("hex");
				const evaluation = await FacultyEvaluation.create({
					facultyId,
					evaluatorId: userId,
					message,
					rating,
					uniqueCode,
					departmentId: faculty.departmentId,
					academicPeriod,
				});

				return res.status(201).json({
					success: true,
					message: "Evaluation created successfully.",
					evaluation,
				});
			} catch (err) {
				console.error(err);

				if (err.name === "SequelizeUniqueConstraintError") {
					return res.status(409).json({
						success: false,
						message: "Duplicate evaluation detected.",
					});
				}
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});
	}

	putRouter() {
		this.router.put("/update/:id", async (req, res) => {
			try {
				const { id } = req.params;
				const { message, rating } = req.body;
				const evaluatorId = req.user?.userId;

				if (!evaluatorId) {
					return res.status(401).json({
						success: false,
						message: "Unauthorized.",
					});
				}

				if (!message || !rating) {
					return res.status(400).json({
						success: false,
						message: "Missing required fields.",
					});
				}

				if (rating < 1 || rating > 4) {
					return res.status(400).json({
						success: false,
						message: "Rating must be between 1 and 4.",
					});
				}

				const evaluation = await FacultyEvaluation.findOne({
					where: {
						id,
						evaluatorId
					}
				});

				if (!evaluation) {
					return res.status(404).json({
						success: false,
						message: "Evaluation not found or you don't have permission to update it.",
					});
				}

				await evaluation.update({
					message,
					rating,
				});

				return res.json({
					success: true,
					message: "Evaluation updated successfully.",
					evaluation,
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

	deleteRouter() {
		this.router.delete("/delete/:id", async (req, res) => {
			try {
				const { id } = req.params;
				const evaluatorId = req.user?.userId;

				if (!evaluatorId) {
					return res.status(401).json({
						success: false,
						message: "Unauthorized.",
					});
				}

				const evaluation = await FacultyEvaluation.findOne({
					where: {
						id,
						evaluatorId 
					}
				});

				if (!evaluation) {
					return res.status(404).json({
						success: false,
						message: "Evaluation not found or you don't have permission to delete it.",
					});
				}

				await evaluation.update({ status: "ARCHIVED" });
				// Option 2: Hard delete (uncomment if you prefer this)
				// await evaluation.destroy();

				return res.json({
					success: true,
					message: "Evaluation deleted successfully.",
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

module.exports = new FacultyEvaluationRouter().router;