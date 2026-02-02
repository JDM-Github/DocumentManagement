// Author: JDM
// Created on: 2026-01-24T11:07:20.344Z

const express = require("express");
const bcrypt = require("bcryptjs");
const { User, Department } = require("../models/Models");
const upload = require("../middlewares/UploadProfileMiddleware");

class UserRouter {
	constructor() {
		this.router = express.Router();
		this.getRouter();
		this.postRouter();
		this.putRouter();
		this.deleteRouter();
	}

	// =========================
	// GET ROUTES
	// =========================
	getRouter() {
		this.router.get("/get-all", async (req, res) => {
			try {
				const users = await User.findAll({
					attributes: { exclude: ["passwordHash"] },
				});

				return res.json({
					success: true,
					message: "Successfully fetched all users.",
					users,
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
				const user = await User.findOne({
					where: { id: req.params.id },
					attributes: { exclude: ["passwordHash"] },
				});

				if (!user) {
					return res.status(404).json({
						success: false,
						message: "User not found.",
					});
				}

				return res.json({
					success: true,
					user,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/me", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const departmentId = req.user?.departmentId;

				if (!userId || !departmentId) {
					return res.status(400).json({
						success: false,
						message: "User ID and department ID are required",
					});
				}

				const user = await User.findByPk(userId, {
					attributes: {
						exclude: ["passwordHash", "deletedAt"],
					},
				});

				if (!user) {
					return res.status(404).json({
						success: false,
						message: "User not found",
					});
				}

				const department = await Department.findByPk(departmentId);
				if (!department) {
					return res.status(404).json({
						success: false,
						message: "Department not found",
					});
				}

				const userData = user.get({ plain: true });

				return res.json({
					success: true,
					user: { ...userData, departmentName: department.name },
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error",
				});
			}
		});


	}

	postRouter() {
		this.router.post("/create", async (req, res) => {
			try {
				const {
					employeeNo,
					firstName,
					middleName,
					lastName,
					email,
					password,
					contactNumber,
					streetAddress,
					barangay,
					city,
					province,
					postalCode,
					dateOfBirth,
					gender,
					role,
					departmentId,
					jobTitle,
					dateHired,
					employmentStatus,
					emergencyContactName,
					emergencyContactNumber,
					emergencyContactRelationship,
					profilePhoto,
				} = req.body;

				// Validation
				if (!firstName || !lastName || !email || !password || !departmentId) {
					return res.status(400).json({
						success: false,
						message: "Required fields: firstName, lastName, email, password, departmentId",
					});
				}

				// Check if email already exists
				const existingUser = await User.findOne({ where: { email } });
				if (existingUser) {
					return res.status(409).json({
						success: false,
						message: "Email already exists.",
					});
				}

				// Check if employeeNo already exists (if provided)
				if (employeeNo) {
					const existingEmployeeNo = await User.findOne({ where: { employeeNo } });
					if (existingEmployeeNo) {
						return res.status(409).json({
							success: false,
							message: "Employee number already exists.",
						});
					}
				}

				// Hash password
				const bcrypt = require("bcrypt");
				const passwordHash = await bcrypt.hash(password, 10);

				// Create user
				const user = await User.create({
					employeeNo,
					firstName,
					middleName,
					lastName,
					email,
					passwordHash,
					contactNumber,
					streetAddress,
					barangay,
					city,
					province,
					postalCode,
					dateOfBirth,
					gender,
					role: role || "USER",
					departmentId,
					jobTitle,
					dateHired,
					employmentStatus: employmentStatus || "ACTIVE",
					emergencyContactName,
					emergencyContactNumber,
					emergencyContactRelationship,
					profilePhoto,
				});

				const userResponse = user.toJSON();
				delete userResponse.passwordHash;

				return res.status(201).json({
					success: true,
					message: "User created successfully.",
					user: userResponse,
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

	// =========================
	// PUT ROUTES
	// =========================
	putRouter() {
		this.router.put("/update", upload.single("profilePhoto"), async (req, res) => {
			try {
				const userId = req.user?.userId;
				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User ID is required",
					});
				}

				const {
					employeeNo,
					firstName,
					middleName,
					lastName,
					email,
					contactNumber,
					streetAddress,
					barangay,
					city,
					province,
					postalCode,
					dateOfBirth,
					gender,
					jobTitle,
					dateHired,
					emergencyContactName,
					emergencyContactNumber,
					emergencyContactRelationship,
				} = req.body;

				const user = await User.findByPk(userId);
				if (!user) {
					return res.status(404).json({
						success: false,
						message: "User not found.",
					});
				}

				if (email && email !== user.email) {
					const existingEmail = await User.findOne({ where: { email } });
					if (existingEmail) {
						return res.status(409).json({
							success: false,
							message: "Email already exists.",
						});
					}
				}

				if (employeeNo && employeeNo !== user.employeeNo) {
					const existingEmployeeNo = await User.findOne({
						where: { employeeNo }
					});
					if (existingEmployeeNo) {
						return res.status(409).json({
							success: false,
							message: "Employee number already exists.",
						});
					}
				}

				const profilePhotoUrl = req.file ? req.file.path : undefined;

				await User.update({
					employeeNo: employeeNo !== undefined ? employeeNo : user.employeeNo,
					firstName: firstName || user.firstName,
					middleName: middleName !== undefined ? middleName : user.middleName,
					lastName: lastName || user.lastName,
					email: email || user.email,
					contactNumber: contactNumber !== undefined ? contactNumber : user.contactNumber,
					streetAddress: streetAddress !== undefined ? streetAddress : user.streetAddress,
					barangay: barangay !== undefined ? barangay : user.barangay,
					city: city !== undefined ? city : user.city,
					province: province !== undefined ? province : user.province,
					postalCode: postalCode !== undefined ? postalCode : user.postalCode,
					dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : user.dateOfBirth,
					gender: gender !== undefined ? gender : user.gender,
					jobTitle: jobTitle !== undefined ? jobTitle : user.jobTitle,
					dateHired: dateHired !== undefined ? dateHired : user.dateHired,
					emergencyContactName: emergencyContactName !== undefined ? emergencyContactName : user.emergencyContactName,
					emergencyContactNumber: emergencyContactNumber !== undefined ? emergencyContactNumber : user.emergencyContactNumber,
					emergencyContactRelationship: emergencyContactRelationship !== undefined ? emergencyContactRelationship : user.emergencyContactRelationship,
					profilePhoto: profilePhotoUrl !== undefined ? profilePhotoUrl : user.profilePhoto,
				}, { where: { id: userId } });

				const updatedUser = await User.findByPk(userId, {
					attributes: { exclude: ["passwordHash"] },
				});

				return res.json({
					success: true,
					message: "User updated successfully.",
					user: updatedUser,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.put("/change-password/:id", async (req, res) => {
			try {
				const { password } = req.body;

				if (!password) {
					return res.status(400).json({
						success: false,
						message: "Password is required.",
					});
				}

				const user = await User.findByPk(req.params.id);
				if (!user) {
					return res.status(404).json({
						success: false,
						message: "User not found.",
					});
				}

				const passwordHash = await bcrypt.hash(password, 10);
				await user.update({ passwordHash });

				return res.json({
					success: true,
					message: "Password updated successfully.",
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
				const user = await User.findByPk(req.params.id);

				if (!user) {
					return res.status(404).json({
						success: false,
						message: "User not found.",
					});
				}

				await user.destroy();

				return res.json({
					success: true,
					message: "User deleted successfully.",
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

module.exports = new UserRouter().router;
