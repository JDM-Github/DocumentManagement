// Author: JDM
// Created on: 2026-02-06

const express = require("express");
const { TravelOrder, User, Department } = require("../models/Models");
const upload = require("../middlewares/UploadMiddleware");

class TravelOrderRouter {
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
				const userId = req.user?.userId;
				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User id is required.",
					});
				}
				const travelOrders = await TravelOrder.findAll({
					where: { userId },
					order: [["createdAt", "DESC"]],
				});
				return res.json({
					success: true,
					message: "Successfully fetched all travel orders.",
					travelOrders,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/user/:userId", async (req, res) => {
			try {
				const { userId } = req.params;
				const travelOrders = await TravelOrder.findAll({
					where: { userId },
					order: [["createdAt", "DESC"]],
				});

				return res.json({
					success: true,
					message: "Successfully fetched user's travel orders.",
					travelOrders,
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
				const role = req.user?.role;

				if (role !== "DEAN" && role !== "PRESIDENT") {
					return res.status(403).json({
						success: false,
						message: "Access denied. Insufficient permissions.",
					});
				}

				const travelOrders = await TravelOrder.findAll({
					order: [["createdAt", "DESC"]],
				});

				const travelOrdersWithUsers = await Promise.all(
					travelOrders.map(async (order) => {
						const user = await User.findByPk(order.userId, {
							attributes: ["id", "firstName", "lastName", "email", "departmentId"]
						});

						return {
							...order.toJSON(),
							User: user
						};
					})
				);

				return res.json({
					success: true,
					message: "Successfully fetched all travel orders.",
					travelOrders: travelOrdersWithUsers,
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
						message: "Department ID is required.",
					});
				}

				const travelOrders = await TravelOrder.findAll({
					where: { departmentId },
					order: [["createdAt", "DESC"]],
				});
				console.log(travelOrders);

				const travelOrdersWithUsers = await Promise.all(
					travelOrders.map(async (order) => {
						const user = await User.findByPk(order.userId, {
							attributes: ["id", "firstName", "lastName", "email"]
						});
						return {
							...order.toJSON(),
							user
						};
					})
				);

				return res.json({
					success: true,
					message: "Successfully fetched department travel orders.",
					travelOrders: travelOrdersWithUsers,
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
				const { id } = req.params;

				const travelOrder = await TravelOrder.findByPk(id);

				if (!travelOrder) {
					return res.status(404).json({
						success: false,
						message: "Travel order not found.",
					});
				}

				const user = await User.findByPk(travelOrder.userId, {
					attributes: ["id", "firstName", "lastName", "email"]
				});

				const department = await Department.findByPk(travelOrder.departmentId, {
					attributes: ["id", "name"]
				});

				return res.json({
					success: true,
					message: "Travel order fetched successfully.",
					travelOrder: {
						...travelOrder.toJSON(),
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
	}

	postRouter() {
		// Create travel order
		this.router.post("/create", upload.single("attachedFile"), async (req, res) => {
			try {
				const userId = req.user?.userId;
				const departmentId = req.user?.departmentId;

				const {
					transportationUsed,
					destination,
					dateOfDepartureFrom,
					dateOfDepartureTo,
					timeOfDeparture,
					timeOfArrival,
					purpose,
					purposeType,
					forwardToHR,
				} = req.body;

				if (!userId || !departmentId) {
					return res.status(400).json({
						success: false,
						message: "User and department are required.",
					});
				}

				if (
					!transportationUsed ||
					!destination ||
					!dateOfDepartureFrom ||
					!dateOfDepartureTo ||
					!timeOfDeparture ||
					!purpose ||
					!purposeType
				) {
					return res.status(400).json({
						success: false,
						message: "All required fields must be provided.",
					});
				}

				// Validate date range
				const fromDate = new Date(dateOfDepartureFrom);
				const toDate = new Date(dateOfDepartureTo);

				if (toDate < fromDate) {
					return res.status(400).json({
						success: false,
						message: "End date cannot be before start date.",
					});
				}

				const travelOrder = await TravelOrder.create({
					userId,
					departmentId,
					transportationUsed,
					destination,
					dateOfDepartureFrom,
					dateOfDepartureTo,
					timeOfDeparture,
					timeOfArrival: timeOfArrival || null,
					purpose,
					purposeType,
					attachedFile: req.file ? req.file.path : null,
					forwardToHR: forwardToHR === "true" || forwardToHR === true,
				});

				return res.status(201).json({
					success: true,
					message: "Travel order created successfully.",
					travelOrder,
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
					transportationUsed,
					destination,
					dateOfDepartureFrom,
					dateOfDepartureTo,
					timeOfDeparture,
					timeOfArrival,
					purpose,
					purposeType,
					forwardToHR,
				} = req.body;

				const travelOrder = await TravelOrder.findByPk(id);

				if (!travelOrder) {
					return res.status(404).json({
						success: false,
						message: "Travel order not found.",
					});
				}

				if (travelOrder.status !== "PENDING") {
					return res.status(400).json({
						success: false,
						message: "Cannot update travel order that is already processed.",
					});
				}

				if (dateOfDepartureFrom && dateOfDepartureTo) {
					const fromDate = new Date(dateOfDepartureFrom);
					const toDate = new Date(dateOfDepartureTo);

					if (toDate < fromDate) {
						return res.status(400).json({
							success: false,
							message: "End date cannot be before start date.",
						});
					}
				}

				await travelOrder.update({
					transportationUsed: transportationUsed || travelOrder.transportationUsed,
					destination: destination || travelOrder.destination,
					dateOfDepartureFrom: dateOfDepartureFrom || travelOrder.dateOfDepartureFrom,
					dateOfDepartureTo: dateOfDepartureTo || travelOrder.dateOfDepartureTo,
					timeOfDeparture: timeOfDeparture || travelOrder.timeOfDeparture,
					timeOfArrival: timeOfArrival || travelOrder.timeOfArrival,
					purpose: purpose || travelOrder.purpose,
					purposeType: purposeType || travelOrder.purposeType,
					forwardToHR: forwardToHR !== undefined ? forwardToHR : travelOrder.forwardToHR,
				});

				return res.json({
					success: true,
					message: "Travel order updated successfully.",
					travelOrder,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.put("/update-status/:id", async (req, res) => {
			try {
				const { id } = req.params;
				const { status, isInDean, isInPresident, isHaveDeanSignature, isHavePresidentSignature } = req.body;

				const travelOrder = await TravelOrder.findByPk(id);

				if (!travelOrder) {
					return res.status(404).json({
						success: false,
						message: "Travel order not found.",
					});
				}

				await travelOrder.update({
					status: status || travelOrder.status,
					isInDean: isInDean !== undefined ? isInDean : travelOrder.isInDean,
					isInPresident: isInPresident !== undefined ? isInPresident : travelOrder.isInPresident,
					isHaveDeanSignature: isHaveDeanSignature !== undefined ? isHaveDeanSignature : travelOrder.isHaveDeanSignature,
					isHavePresidentSignature: isHavePresidentSignature !== undefined ? isHavePresidentSignature : travelOrder.isHavePresidentSignature,
				});

				return res.json({
					success: true,
					message: "Travel order updated successfully.",
					travelOrder,
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
		// Delete travel order (soft delete)
		this.router.delete("/delete/:id", async (req, res) => {
			try {
				const { id } = req.params;

				const travelOrder = await TravelOrder.findByPk(id);

				if (!travelOrder) {
					return res.status(404).json({
						success: false,
						message: "Travel order not found.",
					});
				}

				await travelOrder.destroy();

				return res.json({
					success: true,
					message: "Travel order deleted successfully.",
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

module.exports = new TravelOrderRouter().router;