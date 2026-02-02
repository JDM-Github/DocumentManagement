// Author: JDM
// Created on: 2026-01-24T11:09:17.630Z

const express = require("express");
const { Department } = require("../models/Models");

class DepartmentRouter {
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
				const departments = await Department.findAll();

				return res.json({
					success: true,
					message: "Successfully fetched all departments.",
					departments,
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
				const department = await Department.findByPk(req.params.id);

				if (!department) {
					return res.status(404).json({
						success: false,
						message: "Department not found.",
					});
				}

				return res.json({
					success: true,
					department,
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
				const { name, code } = req.body;

				if (!name) {
					return res.status(400).json({
						success: false,
						message: "Department name is required.",
					});
				}

				const existing = await Department.findOne({ where: { name } });
				if (existing) {
					return res.status(409).json({
						success: false,
						message: "Department already exists.",
					});
				}

				const department = await Department.create({
					name,
					code,
				});

				return res.status(201).json({
					success: true,
					message: "Department created successfully.",
					department,
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
				const { name, code, isActive } = req.body;

				const department = await Department.findByPk(req.params.id);

				if (!department) {
					return res.status(404).json({
						success: false,
						message: "Department not found.",
					});
				}

				await department.update({
					name,
					code,
					isActive,
				});

				return res.json({
					success: true,
					message: "Department updated successfully.",
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
				const department = await Department.findByPk(req.params.id);

				if (!department) {
					return res.status(404).json({
						success: false,
						message: "Department not found.",
					});
				}

				await department.destroy();

				return res.json({
					success: true,
					message: "Department deleted successfully.",
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

module.exports = new DepartmentRouter().router;
