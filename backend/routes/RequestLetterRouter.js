// Author: JDM
// Created on: 2026-01-24T11:10:57.465Z

const express = require("express");
const { Op } = require("sequelize");
const { RequestLetter, RequestLetterLog, User, Department, Signature, Notification } = require("../models/Models");
const upload = require("../middlewares/UploadMiddleware");

class RequestLetterRouter {
	constructor() {
		this.router = express.Router();
		this.getRouter();
		this.postRouter();
		this.putRouter();
	}

	getRouter() {
		this.router.get("/get-all", async (req, res) => {
			try {
				const requestLetters = await RequestLetter.findAll({
					order: [["createdAt", "DESC"]],
				});

				return res.json({
					success: true,
					message: "Successfully fetched all request letters.",
					requestLetters,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/my-requests/:userId", async (req, res) => {
			try {
				const requestLetters = await RequestLetter.findAll({
					where: { requesterId: req.params.userId },
					order: [["createdAt", "DESC"]],
				});

				return res.json({
					success: true,
					requestLetters,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/department/:departmentId/:status", async (req, res) => {
			try {
				const { departmentId, status } = req.params;

				const requestLetters = await RequestLetter.findAll({
					where: {
						currentDepartmentId: departmentId,
						status,
					},
					order: [["createdAt", "DESC"]],
				});

				return res.json({
					success: true,
					requestLetters,
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
				const requestLetter = await RequestLetter.findByPk(req.params.id);

				if (!requestLetter) {
					return res.status(404).json({
						success: false,
						message: "Request letter not found.",
					});
				}

				const department = await Department.findByPk(
					requestLetter.currentDepartmentId
				);
				requestLetter.dataValues.currentDepartmentName = department
					? department.name
					: "N/A";

				return res.json({
					success: true,
					requestLetter,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/logs/:id", async (req, res) => {
			try {
				const logs = await RequestLetterLog.findAll({
					where: {
						requestLetterId: req.params.id,
					},
					order: [["createdAt", "DESC"]],
				});

				if (!logs) {
					return res.status(404).json({
						success: false,
						message: "Request letter logs not found.",
					});
				}

				const allActedByMap = logs.map((log) => log.actedBy);
				const uniqueActedByIds = [
					...new Set(allActedByMap.filter((id) => id !== null)),
				];

				const users = await User.findAll({
					where: {
						id: {
							[Op.in]: uniqueActedByIds,
						},
					},
				});

				const userMap = {};
				users.forEach((user) => {
					userMap[user.id] = `${user.firstName} ${user.lastName}`;
				});

				logs.forEach((log) => {
					log.dataValues.actedByName = log.actedBy
						? userMap[log.actedBy] || "Unknown User"
						: "System";
				});

				const allFromDepartmentMap = logs.map((log) => log.fromDepartmentId);
				const uniqueFromDepartmentIds = [
					...new Set(allFromDepartmentMap.filter((id) => id !== null)),
				];

				const fromDepartments = await Department.findAll({
					where: {
						id: {
							[Op.in]: uniqueFromDepartmentIds,
						},
					},
				});

				const fromDepartmentMap = {};
				fromDepartments.forEach((dept) => {
					fromDepartmentMap[dept.id] = dept.name;
				});

				logs.forEach((log) => {
					log.dataValues.fromDepartmentName = log.fromDepartmentId
						? fromDepartmentMap[log.fromDepartmentId] || "Unknown Department"
						: "N/A";
				});

				const allToDepartmentMap = logs.map((log) => log.toDepartmentId);
				const uniqueToDepartmentIds = [
					...new Set(allToDepartmentMap.filter((id) => id !== null)),
				];

				const toDepartments = await Department.findAll({
					where: {
						id: {
							[Op.in]: uniqueToDepartmentIds,
						},
					},
				});

				const toDepartmentMap = {};
				toDepartments.forEach((dept) => {
					toDepartmentMap[dept.id] = dept.name;
				});

				logs.forEach((log) => {
					log.dataValues.toDepartmentName = log.toDepartmentId
						? toDepartmentMap[log.toDepartmentId] || "Unknown Department"
						: "N/A";
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

		this.router.get(
			"/user/:userId/:status?",

			async (req, res) => {
				try {
					const { userId, status } = req.params;

					const whereClause = {
						requesterId: userId,
					};

					if (status) {
						whereClause.status = status;
					}

					const requestLetters = await RequestLetter.findAll({
						where: whereClause,
						order: [["createdAt", "DESC"]],
					});

					return res.json({
						success: true,
						requestLetters,
					});
				} catch (err) {
					console.error(err);
					return res.status(500).json({
						success: false,
						message: "Internal server error.",
					});
				}
			}
		);

		this.router.get(
			"/log/:action/:departmentId",

			async (req, res) => {
				try {
					const { action, departmentId } = req.params;
					const whereClause = {
						[Op.or]: [
							{ toDepartmentId: departmentId },
							{ fromDepartmentId: departmentId },
						],
					};
					if (action !== "REVIEWED") {
						whereClause.action = action;
					}
					const logs = await RequestLetterLog.findAll({
						where: whereClause,
						order: [["createdAt", "DESC"]],
					});

					const requestLetterIds = logs.map((log) => log.requestLetterId);
					const actedByIds = logs.map((log) => log.actedBy);

					const requestLetters = await RequestLetter.findAll({
						where: { id: { [Op.in]: requestLetterIds } },
					});
					const requestMap = Object.fromEntries(
						requestLetters.map((r) => [r.id, r])
					);

					const users = await User.findAll({
						where: { id: { [Op.in]: actedByIds } },
					});
					const userMap = Object.fromEntries(
						users.map((u) => [u.id, `${u.firstName} ${u.lastName}`])
					);

					const formattedLogs = logs.map((log) => {
						const request = requestMap[log.requestLetterId];
						return {
							id: log.id,
							requestLetterId: log.requestLetterId,
							action: log.action,
							fromDepartmentId: log.fromDepartmentId,
							toDepartmentId: log.toDepartmentId,
							requestNo: request?.requestNo || "N/A",
							requesterName: request?.requesterName || "N/A",
							actedByName: userMap[log.actedBy] || "System",
							remarks: log.remarks || "",
							createdAt: log.createdAt,
						};
					});

					return res.json({ success: true, logs: formattedLogs });
				} catch (err) {
					console.error(err);
					return res.status(500).json({
						success: false,
						message: "Internal server error.",
					});
				}
			}
		);


		this.router.get(
			"/tracker/:userId",

			async (req, res) => {
				try {
					const { userId } = req.params;

					const requests = await RequestLetter.findAll({
						where: { requesterId: userId },
						attributes: ["id", "requestNo", "requesterName"],
					});

					if (!requests.length) {
						return res.json({ success: true, logs: [] });
					}

					const requestIds = requests.map((r) => r.id);
					const requestMap = Object.fromEntries(
						requests.map((r) => [r.id, r])
					);

					const logs = await RequestLetterLog.findAll({
						where: {
							requestLetterId: { [Op.in]: requestIds },
						},
						order: [["createdAt", "ASC"]],
					});

					const actedByIds = [
						...new Set(logs.map((l) => l.actedBy).filter(Boolean)),
					];

					const users = await User.findAll({
						where: { id: { [Op.in]: actedByIds } },
					});

					const userMap = Object.fromEntries(
						users.map((u) => [u.id, `${u.firstName} ${u.lastName}`])
					);

					const formattedLogs = logs.map((log) => {
						const request = requestMap[log.requestLetterId];

						return {
							id: log.id,
							requestLetterId: log.requestLetterId,
							requestNo: request?.requestNo || "N/A",
							requesterName: request?.requesterName || "N/A",
							action: log.action,
							fromDepartmentId: log.fromDepartmentId,
							toDepartmentId: log.toDepartmentId,
							actedByName: userMap[log.actedBy] || "System",
							remarks: log.remarks || "",
							createdAt: log.createdAt,
						};
					});

					return res.json({
						success: true,
						logs: formattedLogs,
					});
				} catch (err) {
					console.error(err);
					return res.status(500).json({
						success: false,
						message: "Internal server error.",
					});
				}
			}
		);

	}

	postRouter() {

		this.router.post(
			"/create",
			upload.array("documents"),
			async (req, res) => {
				try {
					const { requesterId, purpose, currentDepartmentId, createdBy } = req.body;

					if (!requesterId || !purpose || !currentDepartmentId || !createdBy) {
						return res.status(400).json({
							success: false,
							message: "Missing required fields.",
						});
					}

					const requestNo = `REQ-${Date.now()}`;
					const uploadedFiles = req.files?.map(file => file.path || file.secure_url);

					const user = await User.findByPk(requesterId);
					if (!user) {
						return res.status(404).json({
							success: false,
							message: "Requester not found.",
						});
					}

					const requesterName = `${user.firstName} ${user.lastName}`;
					const request = await RequestLetter.create({
						requestNo,
						requesterId,
						requesterName,
						purpose,
						currentDepartmentId,
						createdBy,
						requestUploadedDocuments: uploadedFiles?.length ? uploadedFiles.join(",") : null,
						status: "TO_RECEIVE",
					});

					await RequestLetterLog.create({
						requestLetterId: request.id,
						action: "CREATED",
						fromDepartmentId: null,
						toDepartmentId: currentDepartmentId,
						actedBy: createdBy,
						remarks: "Request created",
					});

					return res.json({
						success: true,
						message: "Request created successfully.",
						request,
					});
				} catch (err) {
					console.error(err);
					return res.status(500).json({
						success: false,
						message: "Internal server error.",
					});
				}
			}
		);


	}


	putRouter() {
		this.router.put("/action/:id/:userId/accept", async (req, res) => {
			try {
				const { id, userId } = req.params;
				const { remarks } = req.body;
				const request = await RequestLetter.findByPk(id);

				if (!request) return res.status(404).json({ success: false, message: "Request not found." });
				if (request.status !== "TO_RECEIVE") return res.status(400).json({ success: false, message: "Request is not pending to receive." });

				await RequestLetter.update({ status: "ONGOING" }, { where: { id } });
				await RequestLetterLog.create({
					requestLetterId: id,
					action: "RECEIVED",
					fromDepartmentId: request.currentDepartmentId,
					toDepartmentId: request.currentDepartmentId,
					actedBy: userId,
					remarks: remarks || "Accepted / received request",
				});

				return res.json({ success: true, message: "Request accepted successfully." });
			} catch (err) {
				console.error(err);
				return res.status(500).json({ success: false, message: "Internal server error." });
			}
		});

		this.router.put("/action/:id/:userId/complete", async (req, res) => {
			try {
				const { id, userId } = req.params;
				const { remarks } = req.body;
				const request = await RequestLetter.findByPk(id);

				if (!request) return res.status(404).json({ success: false, message: "Request not found." });

				await RequestLetter.update({ status: "COMPLETED" }, { where: { id } });
				await RequestLetterLog.create({
					requestLetterId: id,
					action: "COMPLETED",
					fromDepartmentId: request.currentDepartmentId,
					toDepartmentId: request.currentDepartmentId,
					actedBy: userId,
					remarks: remarks || "Request completed",
				});

				return res.json({ success: true, message: "Request completed successfully." });
			} catch (err) {
				console.error(err);
				return res.status(500).json({ success: false, message: "Internal server error." });
			}
		});

		// SIGN / APPROVE
		this.router.put("/action/:id/:userId/sign", async (req, res) => {
			try {
				const { id, userId } = req.params;
				const { remarks } = req.body;

				const request = await RequestLetter.findByPk(id);
				if (!request) {
					return res.status(404).json({
						success: false,
						message: "Request not found."
					});
				}
				const allSignatures = request.allSignature || [];
				if (allSignatures.includes(Number(userId))) {
					return res.status(400).json({
						success: false,
						message: "You already signed this request."
					});
				}
				allSignatures.push(Number(userId));
				await RequestLetter.update(
					{ allSignature: allSignatures },
					{ where: { id } }
				);

				const signerUser = await User.findByPk(userId);
				if (signerUser) {
					await Notification.create({
						userId: userId.toString(),
						title: "Document Signed Successfully",
						message: `You have successfully signed request ${request.requestNo}.`,
						type: "success",
						metadata: {
							requestId: id,
							requestNo: request.requestNo,
							action: "signed",
							documentName: request.purpose,
							timestamp: new Date().toISOString()
						},
						link: `/requests/${id}`
					});
				}
				await Notification.create({
					userId: request.requesterId.toString(),
					title: "Your Document Has Been Signed",
					message: `${signerUser ? `${signerUser.firstName} ${signerUser.lastName}` : 'A user'} has signed your document "${request.purpose}".`,
					type: "document",
					metadata: {
						requestId: id,
						requestNo: request.requestNo,
						signerId: userId,
						signerName: signerUser ? `${signerUser.firstName} ${signerUser.lastName}` : 'Unknown',
						action: "signed",
						timestamp: new Date().toISOString()
					},
					link: `/requests/${id}`
				});

				await Signature.create({
					requestLetterId: id,
					userId: Number(userId),
					signedAt: new Date(),
				});

				await RequestLetterLog.create({
					requestLetterId: id,
					action: "REVIEWED",
					fromDepartmentId: request.currentDepartmentId,
					toDepartmentId: request.currentDepartmentId,
					actedBy: userId,
					remarks: remarks || "Signed / approved by user",
				});
				return res.json({
					success: true,
					message: "Request signed successfully."
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error."
				});
			}
		});

		// FORWARD
		this.router.put("/action/:id/:userId/forward", async (req, res) => {
			try {
				const { id, userId } = req.params;
				const { currentDepartmentId, remarks } = req.body;

				const request = await RequestLetter.findByPk(id);
				if (!request) return res.status(404).json({ success: false, message: "Request not found." });

				if (currentDepartmentId) {
					await RequestLetter.update({ currentDepartmentId }, { where: { id } });
				}
				await RequestLetterLog.create({
					requestLetterId: id,
					action: "FORWARDED",
					fromDepartmentId: request.currentDepartmentId,
					toDepartmentId: currentDepartmentId || null,
					actedBy: userId,
					remarks: remarks || "Forwarded to another department",
				});
				return res.json({ success: true, message: "Request forwarded successfully." });
			} catch (err) {
				console.error(err);
				return res.status(500).json({ success: false, message: "Internal server error." });
			}
		});

		// RELEASE
		this.router.put("/action/:id/:userId/release", async (req, res) => {
			try {
				const { id, userId } = req.params;
				const { remarks } = req.body;
				const request = await RequestLetter.findByPk(id);

				if (!request) return res.status(404).json({ success: false, message: "Request not found." });
				await RequestLetter.update({ status: "TO_RELEASE" }, { where: { id } });

				await RequestLetterLog.create({
					requestLetterId: id,
					action: "RELEASED",
					fromDepartmentId: request.currentDepartmentId,
					toDepartmentId: request.currentDepartmentId,
					actedBy: userId,
					remarks: remarks || "Request released",
				});

				return res.json({ success: true, message: "Request released successfully." });
			} catch (err) {
				console.error(err);
				return res.status(500).json({ success: false, message: "Internal server error." });
			}
		});

		// DENY
		this.router.put("/action/:id/:userId/deny", async (req, res) => {
			try {
				const { id, userId } = req.params;
				const { remarks } = req.body;
				const request = await RequestLetter.findByPk(id);

				if (!request) return res.status(404).json({ success: false, message: "Request not found." });

				await RequestLetter.update({ status: "DECLINED" }, { where: { id } });
				await RequestLetterLog.create({
					requestLetterId: id,
					action: "DECLINED",
					fromDepartmentId: request.currentDepartmentId,
					toDepartmentId: request.currentDepartmentId,
					actedBy: userId,
					remarks: remarks || "Denied request",
				});

				return res.json({ success: true, message: "Request denied successfully." });
			} catch (err) {
				console.error(err);
				return res.status(500).json({ success: false, message: "Internal server error." });
			}
		});

	}
}

module.exports = new RequestLetterRouter().router;
