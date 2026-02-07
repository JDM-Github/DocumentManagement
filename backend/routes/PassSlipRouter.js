// Author: JDM
// Created on: 2026-02-01T02:39:33.756Z

const express = require("express");
const { PassSlip, User, Department, Notification } = require("../models/Models");
const { Op } = require("sequelize");

class PassSlipRouter {
	constructor() {
		this.router = express.Router();
		this.getRouter();
		this.postRouter();
		this.putRouter();
	}

	getRouter() {
		// GET /pass-slip/get - Get all pass slips for authenticated user
		this.router.get("/get", async (req, res) => {
			try {
				const userId = req.user?.userId;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User id is required.",
					});
				}

				const passslips = await PassSlip.findAll({
					where: { userId },
					order: [["createdAt", "DESC"]],
				});

				return res.json({
					success: true,
					message: "Successfully fetched pass slips.",
					passslips,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		// GET /pass-slip/get/:id - Get specific pass slip by ID
		this.router.get("/get/:id", async (req, res) => {
			try {
				const { id } = req.params;

				const passSlip = await PassSlip.findByPk(id);

				if (!passSlip) {
					return res.status(404).json({
						success: false,
						message: "Pass slip not found.",
					});
				}

				const user = await User.findByPk(
					passSlip.userId,
					{
						attributes: ["id", "firstName", "lastName", "email"],
					}
				);

				const department = await Department.findByPk(
					passSlip.departmentId,
					{
						attributes: ["name"],
					}
				);

				return res.json({
					success: true,
					message: "Successfully fetched pass slip.",
					passSlip: {
						...passSlip.toJSON(),
						user,
						department
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

		// GET /pass-slip/count - Get total count of pass slips
		this.router.get("/count", async (req, res) => {
			try {
				const userId = req.user?.userId;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User id is required.",
					});
				}

				const count = await PassSlip.count({
					where: { userId }
				});

				return res.json({
					success: true,
					count
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		// GET /pass-slip/stats - Get pass slip statistics
		this.router.get("/stats", async (req, res) => {
			try {
				const userId = req.user?.userId;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User id is required.",
					});
				}

				const total = await PassSlip.count({
					where: { userId }
				});
				const pending = await PassSlip.count({
					where: { userId, status: "PENDING" }
				});
				const approvedByDean = await PassSlip.count({
					where: { userId, status: "APPROVED BY DEAN" }
				});
				const approvedByPresident = await PassSlip.count({
					where: { userId, status: "APPROVED BY PRESIDENT" }
				});
				const rejected = await PassSlip.count({
					where: { userId, status: "REJECTED" }
				});

				// Additional stats by purpose
				const personal = await PassSlip.count({
					where: { userId, purpose: "PERSONAL" }
				});
				const official = await PassSlip.count({
					where: { userId, purpose: "OFFICIAL" }
				});

				// Forwarded to HR count
				const forwardedToHR = await PassSlip.count({
					where: { userId, forwardToHR: true }
				});

				return res.json({
					success: true,
					stats: {
						total,
						byStatus: {
							pending,
							approvedByDean,
							approvedByPresident,
							rejected
						},
						byPurpose: {
							personal,
							official
						},
						forwardedToHR
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

		// Legacy routes (keep for backwards compatibility)
		this.router.get("/get-all", async (req, res) => {
			try {
				const userId = req.user?.userId;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User id is required.",
					});
				}

				const passslips = await PassSlip.findAll({
					where: { userId },
					order: [["createdAt", "DESC"]],
				});

				return res.json({
					success: true,
					message: "Successfully fetched pass slips.",
					passslips,
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
				const isHead = req.user?.isHead || false;

				if (!departmentId) {
					return res.status(400).json({
						success: false,
						message: "Department id is required.",
					});
				}

				const users = await User.findAll({
					where: { departmentId },
				});

				const userIds = users.map(user => user.id);

				if (!userIds.length) {
					return res.json({
						success: true,
						message: "No users in this department.",
						passslips: [],
					});
				}

				const whereClause = {
					userId: { [Op.in]: userIds }
				};
				if (!isHead) {
					whereClause.forwardToHR = true;
				}

				const passslips = await PassSlip.findAll({
					where: whereClause,
					order: [["createdAt", "DESC"]],
				});

				const userMap = users.reduce((acc, user) => {
					acc[user.id] = user;
					return acc;
				}, {});

				const passslipsWithUser = passslips.map(ps => ({
					...ps.toJSON(),
					user: userMap[ps.userId] || null
				}));

				return res.json({
					success: true,
					message: "Successfully fetched department pass slips.",
					passslips: passslipsWithUser,
				});

			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
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
				const passslips = await PassSlip.findAll({
					where: whereClause,
					order: [["createdAt", "DESC"]],
				});
				return res.json({
					success: true,
					message: "Successfully fetched pass slips.",
					passslips,
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
		 * Create a new pass slip
		 */
		this.router.post("/create", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const departmentId = req.user?.departmentId;

				const {
					timeOut,
					timeIn,
					purpose,
					reason,
					forwardToHR = false,
				} = req.body;

				if (!userId || !departmentId) {
					return res.status(400).json({
						success: false,
						message: "User and department are required.",
					});
				}

				if (!timeOut || !purpose || !reason) {
					return res.status(400).json({
						success: false,
						message: "timeOut, purpose, and reason are required.",
					});
				}

				const passSlip = await PassSlip.create({
					userId,
					departmentId,
					timeOut,
					timeIn: timeIn || null,
					purpose,
					reason,
					forwardToHR,
				});

				return res.status(201).json({
					success: true,
					message: "Pass slip created successfully.",
					passSlip,
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
		 * Update pass slip status (HEAD / HR) and send notification
		 */
		this.router.put("/update-status/:id", async (req, res) => {
			try {
				const { id } = req.params;
				const { status } = req.body;
				const isDean = req.user?.role === "DEAN";
				const isPresident = req.user?.role == "PRESIDENT";

				if (!isDean && !isPresident) {
					return res.status(403).json({
						success: false,
						message: "Unauthorized action.",
					});
				}

				const passSlip = await PassSlip.findByPk(id);
				if (!passSlip) {
					return res.status(404).json({
						success: false,
						message: "Pass slip not found.",
					});
				}

				await PassSlip.update({
					status,
					isInPresident: status === "APPROVED BY DEAN" || status === "APPROVED BY PRESIDENT",
					isHaveDeanSignature: status === "APPROVED BY DEAN" || status === "APPROVED BY PRESIDENT",
					isHavePresidentSignature: status === "APPROVED BY PRESIDENT"
				}, { where: { id } });

				const user = await User.findByPk(passSlip.userId, {
					attributes: ["id", "firstName", "lastName", "email"],
				});

				if (user) {
					await Notification.create({
						userId: user.id,
						title: "Pass Slip Status Updated",
						message: `Your pass slip #${passSlip.id} has been ${status.toLowerCase()}.`,
						type: "info",
						link: `/pass-slip/${passSlip.id}`,
						metadata: {
							passSlipId: passSlip.id,
							status,
						},
					});
				}
				return res.json({
					success: true,
					message: "Pass slip status updated successfully and notification sent.",
					passSlip,
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
				const { purpose, reason, timeOut, timeIn, forwardToHR } = req.body;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User is required.",
					});
				}

				const passSlip = await PassSlip.findByPk(id);

				if (!passSlip) {
					return res.status(404).json({
						success: false,
						message: "Pass slip not found.",
					});
				}

				if (passSlip.userId !== userId) {
					return res.status(403).json({
						success: false,
						message: "You are not authorized to edit this pass slip.",
					});
				}

				if (passSlip.status !== "PENDING") {
					return res.status(400).json({
						success: false,
						message: "Only pending pass slips can be edited.",
					});
				}

				await passSlip.update({
					purpose: purpose ?? passSlip.purpose,
					reason: reason ?? passSlip.reason,
					timeOut: timeOut ?? passSlip.timeOut,
					timeIn: timeIn ?? passSlip.timeIn,
					forwardToHR: forwardToHR ?? passSlip.forwardToHR,
				});

				return res.json({
					success: true,
					message: "Pass slip updated successfully.",
					passSlip,
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

module.exports = new PassSlipRouter().router;