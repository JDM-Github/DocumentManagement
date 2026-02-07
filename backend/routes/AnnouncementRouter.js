// Author: JDM
// Created on: 2026-02-07T18:37:47.819Z

const express = require("express");
const { Announcement } = require("../models/Models");

class AnnouncementRouter {
    constructor() {
        this.router = express.Router();
        this.getRouter();
        this.postRouter();
		this.deleteRouter();
		this.putRouter();
    }

    getRouter() {
        this.router.get("/get-all", async (req, res) => {
			try {
				const announcements = await Announcement.findAll();
				return res.json({
					success: true,
					message: "Successfully fetched all announcements.",
					announcements,
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

				const {
					title,
					message,
					type,
					priority,
					startDate,
					endDate,
					targetAudience,
					link,
					metadata,
				} = req.body;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User ID is required.",
					});
				}

				if (!title || !message || !type || !priority || !targetAudience) {
					return res.status(400).json({
						success: false,
						message: "Title, message, type, priority, and target audience are required.",
					});
				}

				const validTypes = ['general', 'maintenance', 'update', 'event', 'urgent'];
				const validPriorities = ['low', 'medium', 'high', 'critical'];
				const validAudiences = ['all', 'students', 'faculty', 'staff', 'admins'];

				if (!validTypes.includes(type)) {
					return res.status(400).json({
						success: false,
						message: "Invalid announcement type.",
					});
				}

				if (!validPriorities.includes(priority)) {
					return res.status(400).json({
						success: false,
						message: "Invalid priority level.",
					});
				}

				if (!validAudiences.includes(targetAudience)) {
					return res.status(400).json({
						success: false,
						message: "Invalid target audience.",
					});
				}

				const announcement = await Announcement.create({
					title,
					message,
					type,
					priority,
					isActive: true,
					startDate: startDate || null,
					endDate: endDate || null,
					targetAudience,
					link: link || null,
					metadata: metadata || {},
					authorId: userId,
				});

				return res.status(201).json({
					success: true,
					message: "Announcement created successfully.",
					announcement,
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
		this.router.put("/update/:id", async (req, res) => {
			try {
				const { id } = req.params;
				const {
					title,
					message,
					type,
					priority,
					startDate,
					endDate,
					targetAudience,
					link,
					isActive,
					metadata,
				} = req.body;

				const announcement = await Announcement.findByPk(id);

				if (!announcement) {
					return res.status(404).json({
						success: false,
						message: "Announcement not found.",
					});
				}

				await announcement.update({
					title: title || announcement.title,
					message: message || announcement.message,
					type: type || announcement.type,
					priority: priority || announcement.priority,
					startDate: startDate !== undefined ? startDate : announcement.startDate,
					endDate: endDate !== undefined ? endDate : announcement.endDate,
					targetAudience: targetAudience || announcement.targetAudience,
					link: link !== undefined ? link : announcement.link,
					isActive: isActive !== undefined ? isActive : announcement.isActive,
					metadata: metadata || announcement.metadata,
				});

				return res.status(200).json({
					success: true,
					message: "Announcement updated successfully.",
					announcement,
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

				const announcement = await Announcement.findByPk(id);

				if (!announcement) {
					return res.status(404).json({
						success: false,
						message: "Announcement not found.",
					});
				}

				await announcement.destroy();

				return res.status(200).json({
					success: true,
					message: "Announcement deleted successfully.",
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

module.exports = new AnnouncementRouter().router;
