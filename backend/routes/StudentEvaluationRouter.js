// Author: JDM
// Created on: 2026-02-05T15:32:26.631Z

const express = require("express");
const crypto = require("crypto");
const { StudentEvaluation, User } = require("../models/Models");

class StudentEvaluationRouter {
    constructor() {
        this.router = express.Router();
        this.getRouter();
        this.postRouter();
    }

    getRouter() {
        this.router.get("/get-all", async (req, res) => {
			try {
				const studentevaluations = await StudentEvaluation.findAll();
				return res.json({
					success: true,
					message: "Successfully fetched all studentevaluations.",
					studentevaluations,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});
		this.router.get("/get-my-code", async (req, res) => {
			try {
				const facultyId = req.user?.userId;

				if (!facultyId) {
					return res.status(401).json({
						success: false,
						message: "Unauthorized.",
					});
				}

				const currentDate = new Date();
				const currentYear = currentDate.getFullYear();
				const currentMonth = currentDate.getMonth() + 1;
				const academicPeriod = currentMonth >= 8
					? `${currentYear}-${currentYear + 1}`
					: `${currentYear - 1}-${currentYear}`;

				let existingCode = await StudentEvaluation.findOne({
					where: {
						facultyId,
						academicPeriod
					},
					attributes: ["uniqueCode"]
				});

				let uniqueCode;

				if (existingCode) {
					uniqueCode = existingCode.uniqueCode;
				} else {
					uniqueCode = crypto.randomBytes(6).toString("hex");
					await StudentEvaluation.create({
						facultyId,
						studentId: null,
						message: "PLACEHOLDER",
						rating: 3,
						uniqueCode,
						academicPeriod,
						status: "ARCHIVED"
					});
				}

				return res.json({
					success: true,
					uniqueCode,
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

		this.router.get("/get-faculty-info/:uniqueCode", async (req, res) => {
			try {
				const { uniqueCode } = req.params;

				const evaluation = await StudentEvaluation.findOne({
					where: { uniqueCode }
				});

				if (!evaluation) {
					return res.status(404).json({
						success: false,
						message: "Invalid evaluation code.",
					});
				}

				const faculty = await User.findByPk(evaluation.facultyId, {
					attributes: ["id", "firstName", "lastName"]
				});

				if (!faculty) {
					return res.status(404).json({
						success: false,
						message: "Faculty not found.",
					});
				}

				return res.json({
					success: true,
					faculty: {
						firstName: faculty.firstName,
						lastName: faculty.lastName,
						academicPeriod: evaluation.academicPeriod
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
		this.router.get("/get-received", async (req, res) => {
			try {
				const facultyId = req.user?.userId;

				if (!facultyId) {
					return res.status(401).json({
						success: false,
						message: "Unauthorized.",
					});
				}

				const evaluations = await StudentEvaluation.findAll({
					where: {
						facultyId,
						status: "ACTIVE"
					},
					attributes: [
						"id",
						"message",
						"rating",
						"courseCode",
						"academicPeriod",
						"status",
						"createdAt",
						"updatedAt"
						// IMPORTANT: Do NOT include studentId or ipAddress for privacy
					],
					order: [
						["academicPeriod", "DESC"],
						["createdAt", "DESC"]
					]
				});

				// Calculate statistics
				const totalEvaluations = evaluations.length;
				const averageRating = totalEvaluations > 0
					? evaluations.reduce((sum, eval2) => sum + eval2.rating, 0) / totalEvaluations
					: 0;

				// Rating distribution
				const ratingDistribution = {
					1: evaluations.filter(e => e.rating === 1).length,
					2: evaluations.filter(e => e.rating === 2).length,
					3: evaluations.filter(e => e.rating === 3).length,
					4: evaluations.filter(e => e.rating === 4).length,
					5: evaluations.filter(e => e.rating === 5).length,
				};

				// Group by academic period
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

		// Get evaluations by academic period
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

				const evaluations = await StudentEvaluation.findAll({
					where: {
						facultyId,
						academicPeriod,
						status: "ACTIVE"
					},
					attributes: [
						"id",
						"message",
						"rating",
						"courseCode",
						"academicPeriod",
						"status",
						"createdAt",
						"updatedAt"
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

		// Get evaluation statistics
		this.router.get("/get-stats", async (req, res) => {
			try {
				const facultyId = req.user?.userId;

				if (!facultyId) {
					return res.status(401).json({
						success: false,
						message: "Unauthorized.",
					});
				}

				const evaluations = await StudentEvaluation.findAll({
					where: {
						facultyId,
						status: "ACTIVE"
					},
					attributes: ["rating", "academicPeriod", "createdAt", "courseCode"]
				});

				const totalEvaluations = evaluations.length;
				const averageRating = totalEvaluations > 0
					? evaluations.reduce((sum, eval2) => sum + eval2.rating, 0) / totalEvaluations
					: 0;

				// Rating distribution
				const ratingDistribution = {
					1: evaluations.filter(e => e.rating === 1).length,
					2: evaluations.filter(e => e.rating === 2).length,
					3: evaluations.filter(e => e.rating === 3).length,
					4: evaluations.filter(e => e.rating === 4).length,
					5: evaluations.filter(e => e.rating === 5).length,
				};

				// Course distribution
				const courses = [...new Set(evaluations.map(e => e.courseCode).filter(Boolean))];
				const courseStats = courses.map(course => ({
					courseCode: course,
					count: evaluations.filter(e => e.courseCode === course).length,
					averageRating: evaluations
						.filter(e => e.courseCode === course)
						.reduce((sum, e) => sum + e.rating, 0) /
						evaluations.filter(e => e.courseCode === course).length
				}));

				return res.json({
					success: true,
					stats: {
						totalEvaluations,
						averageRating: Math.round(averageRating * 100) / 100,
						ratingDistribution,
						courseStats
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
		this.router.post("/submit", async (req, res) => {
			try {
				const { uniqueCode, studentId, rating, courseCode, message } = req.body;

				// Validate required fields
				if (!uniqueCode || !studentId || !rating || !message) {
					return res.status(400).json({
						success: false,
						message: "Missing required fields.",
					});
				}

				// Validate student ID format (YEAR-NUMBER)
				const studentIdRegex = /^\d{4}-\d{5}$/;
				if (!studentIdRegex.test(studentId)) {
					return res.status(400).json({
						success: false,
						message: "Invalid Student ID format. Use: YYYY-XXXXX (e.g., 2022-10934)",
					});
				}

				// Validate rating
				if (rating < 1 || rating > 5) {
					return res.status(400).json({
						success: false,
						message: "Rating must be between 1 and 5.",
					});
				}

				// Get faculty and academic period from existing code
				const existingEval = await StudentEvaluation.findOne({
					where: { uniqueCode }
				});

				if (!existingEval) {
					return res.status(404).json({
						success: false,
						message: "Invalid evaluation code.",
					});
				}

				const facultyId = existingEval.facultyId;
				const academicPeriod = existingEval.academicPeriod;

				// Check if this student already evaluated this faculty in this period
				const duplicate = await StudentEvaluation.findOne({
					where: {
						studentId,
						uniqueCode,
						academicPeriod,
						status: "ACTIVE" // Only check active evaluations
					}
				});

				if (duplicate) {
					return res.status(409).json({
						success: false,
						message: "You have already submitted an evaluation for this academic period.",
					});
				}

				// Get IP address for logging
				const ipAddress = req.ip || req.connection.remoteAddress;

				// Create evaluation
				const evaluation = await StudentEvaluation.create({
					facultyId,
					studentId,
					message,
					rating,
					courseCode: courseCode || null,
					uniqueCode,
					academicPeriod,
					ipAddress,
					status: "ACTIVE"
				});

				return res.status(201).json({
					success: true,
					message: "Thank you for your feedback!",
				});
			} catch (err) {
				console.error(err);

				if (err.name === "SequelizeUniqueConstraintError") {
					return res.status(409).json({
						success: false,
						message: "You have already submitted an evaluation.",
					});
				}

				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});
	}
}

module.exports = new StudentEvaluationRouter().router;
