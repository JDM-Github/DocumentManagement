// Author: JDM
// Created on: 2026-02-04T16:06:58.339Z

const express = require("express");
const { Clearance, User, Notification } = require("../models/Models");

class ClearanceRouter {
	constructor() {
		this.router = express.Router();
		this.getRouter();
		this.postRouter();
		this.putRouter();
	}

	getRouter() {
		/**
		 * Get all clearances of the logged-in user
		 */
		// Inside ClearanceRouter class, add this to getRouter()
		this.router.get("/my", async (req, res) => {
			try {
				const userId = req.user?.userId;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User id is required.",
					});
				}

				const clearances = await Clearance.findAll({
					where: { userId },
					order: [["createdAt", "DESC"]],
				});
				const clearancesWithUser = await Promise.all(
					clearances.map(async (c) => {
						const user = await User.findByPk(c.userId, {
							attributes: ["id", "firstName", "lastName", "email"],
						});
						return {
							...c.toJSON(),
							user,
						};
					})
				);

				return res.json({
					success: true,
					data: clearancesWithUser,
					message: "Successfully fetched your clearances.",
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});


		this.router.get("/get-all", async (req, res) => {
			try {
				const userId = req.user?.userId;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User id is required.",
					});
				}

				const clearances = await Clearance.findAll({
					where: { userId },
					order: [["createdAt", "DESC"]],
				});
				const clearancesWithUser = await Promise.all(
					clearances.map(async (c) => {
						const user = await User.findByPk(c.userId, {
							attributes: ["id", "firstName", "lastName", "email"],
						});
						return {
							...c.toJSON(),
							user,
						};
					})
				);

				return res.json({
					success: true,
					message: "Successfully fetched clearances.",
					clearances: clearancesWithUser,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/get-all-department", async (req, res) => {
			try {
				const departmentId = req.user?.departmentId;
				if (!departmentId) {
					return res.status(400).json({
						success: false,
						message: "Department id is required.",
					});
				}
				const whereClause = {
					departmentId
				}
				const clearances = await Clearance.findAll({
					where: whereClause,
					order: [["createdAt", "DESC"]],
				});
				const clearancesWithUser = await Promise.all(
					clearances.map(async (c) => {
						const user = await User.findByPk(c.userId, {
							attributes: ["id", "firstName", "lastName", "email"],
						});
						return {
							...c.toJSON(),
							user,
						};
					})
				);
				return res.json({
					success: true,
					message: "Successfully fetched department clearances.",
					clearances: clearancesWithUser,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		/**
		 * Get clearances for higher-ups (Dean / President)
		 */
		this.router.get("/get-all-higherup", async (req, res) => {
			try {
				const isDean = req.user?.role === "DEAN";
				const isPresident = req.user?.role === "PRESIDENT";

				const whereClause = {};

				if (isDean) {
					whereClause.isInDean = true;
				}

				if (isPresident) {
					whereClause.isInPresident = true;
				}

				const clearances = await Clearance.findAll({
					where: whereClause,
					order: [["createdAt", "DESC"]],
				});
				const clearancesWithUser = await Promise.all(
					clearances.map(async (c) => {
						const user = await User.findByPk(c.userId, {
							attributes: ["id", "firstName", "lastName", "email"],
						});
						return {
							...c.toJSON(),
							user,
						};
					})
				);

				return res.json({
					success: true,
					message: "Successfully fetched clearances.",
					clearances: clearancesWithUser,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		/**
		 * Get single clearance
		 */
		this.router.get("/get/:id", async (req, res) => {
			try {
				const { id } = req.params;

				const clearance = await Clearance.findByPk(id);

				if (!clearance) {
					return res.status(404).json({
						success: false,
						message: "Clearance not found.",
					});
				}

				const user = await User.findByPk(clearance.userId, {
					attributes: ["id", "firstName", "lastName", "email"],
				});

				return res.json({
					success: true,
					message: "Successfully fetched clearance.",
					clearance: {
						...clearance.toJSON(),
						user,
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
	}

	postRouter() {
		/**
		 * Create a new clearance
		 */
		this.router.post("/create", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const departmentId = req.user?.departmentId;

				const {
					salary,
					position,
					employmentStatus,
					purpose,
					effectiveFrom,
					effectiveTo,
				} = req.body;

				if (!userId || !departmentId) {
					return res.status(400).json({
						success: false,
						message: "User and department ID is required.",
					});
				}

				if (
					!salary ||
					!position ||
					!employmentStatus ||
					!purpose ||
					!effectiveFrom ||
					!effectiveTo
				) {
					return res.status(400).json({
						success: false,
						message: "All clearance fields are required.",
					});
				}

				const clearance = await Clearance.create({
					userId,
					departmentId,
					salary,
					position,
					employmentStatus,
					purpose,
					effectiveFrom,
					effectiveTo,
				});

				return res.status(201).json({
					success: true,
					message: "Clearance created successfully.",
					clearance,
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
		/**
		 * Update clearance status (Dean / President) and send notification
		 */
		this.router.put("/update-status/:id", async (req, res) => {
			try {
				const { id } = req.params;
				const { status } = req.body;
				const isDean = req.user?.role === "DEAN";
				const isPresident = req.user?.role === "PRESIDENT";

				if (!isDean && !isPresident) {
					return res.status(403).json({
						success: false,
						message: "Unauthorized action.",
					});
				}

				const clearance = await Clearance.findByPk(id);
				if (!clearance) {
					return res.status(404).json({
						success: false,
						message: "Clearance not found.",
					});
				}

				await Clearance.update(
					{
						status,
						isInPresident: status === "APPROVED BY DEAN" || status === "APPROVED BY PRESIDENT",
						isHaveDeanSignature: status === "APPROVED BY DEAN" || status === "APPROVED BY PRESIDENT",
						isHavePresidentSignature: status === "APPROVED BY PRESIDENT",
					},
					{ where: { id } }
				);

				const user = await User.findByPk(clearance.userId, {
					attributes: ["id", "firstName", "lastName", "email"],
				});

				if (user) {
					await Notification.create({
						userId: user.id,
						title: "Clearance Status Updated",
						message: `Your clearance #${clearance.id} has been ${status.toLowerCase()}.`,
						type: "info",
						link: `/clearance/${clearance.id}`,
						metadata: { clearanceId: clearance.id, status },
					});
				}

				return res.json({
					success: true,
					message: "Clearance status updated successfully and notification sent.",
					clearance,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});


		this.router.put("/update/:id", async (req, res) => {
			try {
				const { id } = req.params;
				const userId = req.user?.userId;
				const { salary, position, employmentStatus, purpose, effectiveFrom, effectiveTo } = req.body;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User is required.",
					});
				}

				const clearance = await Clearance.findByPk(id);
				if (!clearance) {
					return res.status(404).json({
						success: false,
						message: "Clearance not found.",
					});
				}

				if (clearance.userId !== userId) {
					return res.status(403).json({
						success: false,
						message: "You are not authorized to edit this clearance.",
					});
				}

				if (clearance.status !== "PENDING") {
					return res.status(400).json({
						success: false,
						message: "Only pending clearances can be edited.",
					});
				}

				await clearance.update({
					salary: salary ?? clearance.salary,
					position: position ?? clearance.position,
					employmentStatus: employmentStatus ?? clearance.employmentStatus,
					purpose: purpose ?? clearance.purpose,
					effectiveFrom: effectiveFrom ?? clearance.effectiveFrom,
					effectiveTo: effectiveTo ?? clearance.effectiveTo,
				});

				return res.json({
					success: true,
					message: "Clearance updated successfully.",
					clearance,
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

module.exports = new ClearanceRouter().router;
