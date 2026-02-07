// routes/NotificationRouter.js
// Author: JDM
// Created on: 2026-01-31T13:06:13.488Z

const express = require("express");
const { Notification } = require("../models/Models");

class NotificationRouter {
	constructor() {
		this.router = express.Router();
		this.getRouter();
		this.postRouter();
		this.putRouter();
		this.deleteRouter();
	}

	getRouter() {
		this.router.get("/get", async (req, res) => {
			try {
				const userId = req.user?.userId;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User id is required.",
					});
				}

				const notifications = await Notification.findAll({
					where: { userId: userId.toString() },
					order: [["createdAt", "DESC"]],
				});

				return res.json({
					success: true,
					message: "Successfully fetched notifications.",
					notifications,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});
		
		this.router.get("/count", async (req, res) => {
			try {
				const userId = req.user?.userId;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User id is required.",
					});
				}

				const total = await Notification.count({
					where: { userId: userId.toString() }
				});

				const unread = await Notification.count({
					where: {
						userId: userId.toString(),
						read: false
					}
				});

				const read = await Notification.count({
					where: {
						userId: userId.toString(),
						read: true
					}
				});

				return res.json({
					success: true,
					count: {
						total,
						unread,
						read
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

		this.router.get("/stats", async (req, res) => {
			try {
				const userId = req.user?.userId;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User id is required.",
					});
				}

				const total = await Notification.count({
					where: { userId: userId.toString() }
				});

				const unread = await Notification.count({
					where: {
						userId: userId.toString(),
						read: false
					}
				});

				const read = await Notification.count({
					where: {
						userId: userId.toString(),
						read: true
					}
				});

				// Count by type
				const info = await Notification.count({
					where: { userId: userId.toString(), type: "info" }
				});

				const warning = await Notification.count({
					where: { userId: userId.toString(), type: "warning" }
				});

				const success = await Notification.count({
					where: { userId: userId.toString(), type: "success" }
				});

				const error = await Notification.count({
					where: { userId: userId.toString(), type: "error" }
				});

				const document = await Notification.count({
					where: { userId: userId.toString(), type: "document" }
				});

				const request = await Notification.count({
					where: { userId: userId.toString(), type: "request" }
				});

				return res.json({
					success: true,
					stats: {
						total,
						byReadStatus: {
							unread,
							read
						},
						byType: {
							info,
							warning,
							success,
							error,
							document,
							request
						}
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

		this.router.get("/get-all", async (req, res) => {
			try {
				const userId = req.user?.userId;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User ID is required",
					});
				}

				const notifications = await Notification.findAll({
					where: { userId: userId.toString() },
					order: [['createdAt', 'DESC']]
				});

				return res.json({
					success: true,
					message: "Successfully fetched all notifications.",
					notifications,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/unread-count", async (req, res) => {
			try {
				const userId = req.user?.userId;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User ID is required",
					});
				}

				const count = await Notification.count({
					where: {
						userId: userId.toString(),
						read: false
					}
				});

				return res.json({
					success: true,
					message: "Successfully fetched unread count.",
					count,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/:id", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const { id } = req.params;

				const notification = await Notification.findOne({
					where: {
						id,
						userId: userId.toString()
					}
				});

				if (!notification) {
					return res.status(404).json({
						success: false,
						message: "Notification not found",
					});
				}

				return res.json({
					success: true,
					message: "Successfully fetched notification.",
					notification,
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
				const { userId, title, message, type = 'info', metadata = {}, link = null } = req.body;

				if (!userId || !title || !message) {
					return res.status(400).json({
						success: false,
						message: "userId, title, and message are required",
					});
				}

				const notification = await Notification.create({
					userId: userId.toString(),
					title,
					message,
					type,
					metadata,
					link,
					read: false
				});

				return res.json({
					success: true,
					message: "Notification created successfully.",
					notification,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.post("/mark-all-read", async (req, res) => {
			try {
				const userId = req.user?.userId;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User ID is required",
					});
				}

				await Notification.update(
					{ read: true },
					{
						where: {
							userId: userId.toString(),
							read: false
						}
					}
				);

				return res.json({
					success: true,
					message: "All notifications marked as read.",
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
		this.router.put("/:id/mark-read", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const { id } = req.params;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User ID is required",
					});
				}

				const [updated] = await Notification.update(
					{ read: true },
					{
						where: {
							id,
							userId: userId.toString()
						}
					}
				);

				if (!updated) {
					return res.status(404).json({
						success: false,
						message: "Notification not found",
					});
				}

				return res.json({
					success: true,
					message: "Notification marked as read.",
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.put("/:id", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const { id } = req.params;
				const { title, message, type, metadata, link } = req.body;

				const [updated] = await Notification.update(
					{ title, message, type, metadata, link },
					{
						where: {
							id,
							userId: userId.toString()
						}
					}
				);

				if (!updated) {
					return res.status(404).json({
						success: false,
						message: "Notification not found",
					});
				}

				return res.json({
					success: true,
					message: "Notification updated successfully.",
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
		this.router.delete("/:id", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const { id } = req.params;

				const deleted = await Notification.destroy({
					where: {
						id,
						userId: userId.toString()
					}
				});

				if (!deleted) {
					return res.status(404).json({
						success: false,
						message: "Notification not found",
					});
				}

				return res.json({
					success: true,
					message: "Notification deleted successfully.",
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.delete("/delete-all", async (req, res) => {
			try {
				const userId = req.user?.userId;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User ID is required",
					});
				}

				await Notification.destroy({
					where: { userId }
				});

				return res.json({
					success: true,
					message: "All notifications deleted successfully.",
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

module.exports = new NotificationRouter().router;