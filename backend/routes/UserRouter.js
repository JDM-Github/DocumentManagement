// Author: JDM
// Created on: 2026-01-24T11:07:20.344Z

const express = require("express");
const bcrypt = require("bcryptjs");
const { User, Department, FacultyEvaluation } = require("../models/Models");
const { Op } = require("sequelize");
const upload = require("../middlewares/UploadProfileMiddleware");
const sendEmail = require("../service/EmailService");

const verificationCodes = new Map();

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
		this.router.get("/admin/get-by-role/:filter", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const userRole = req.user?.role;
				const { filter } = req.params;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User authentication required.",
					});
				}

				const allowedRoles = ["MISD", "DEAN", "PRESIDENT"];
				if (!allowedRoles.includes(userRole)) {
					return res.status(403).json({
						success: false,
						message: "Unauthorized. Admin access required.",
					});
				}

				const validFilters = ["ALL", "USER", "MISD", "HEAD", "DEAN", "PRESIDENT", "HIGHERUP"];
				if (!validFilters.includes(filter)) {
					return res.status(400).json({
						success: false,
						message: "Invalid filter.",
					});
				}
				const whereClause = filter === "ALL" ? {} : (filter === "HIGHERUP" ? {
					role: { [Op.in]: ["DEAN", "PRESIDENT"] }
				} : { role: filter });
				const users = await User.findAll({
					where: whereClause,
					attributes: { exclude: ["passwordHash"] },
					order: [
						["role", "ASC"],
						["lastName", "ASC"],
						["firstName", "ASC"],
					],
				});

				const usersWithDepartment = await Promise.all(
					users.map(async (user) => {
						const userData = user.toJSON();

						if (userData.departmentId) {
							const department = await Department.findByPk(userData.departmentId, {
								attributes: ["id", "name"],
							});
							userData.Department = department ? department.toJSON() : null;
						} else {
							userData.Department = null;
						}

						return userData;
					})
				);

				return res.json({
					success: true,
					message: `Successfully fetched ${filter === "ALL" ? "all" : filter} users.`,
					users: usersWithDepartment,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/admin/get-by-department", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const userRole = req.user?.role;
				const departmentId = req.user?.departmentId;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User authentication required.",
					});
				}

				if (!departmentId) {
					return res.status(400).json({
						success: false,
						message: "Department ID not found for this user.",
					});
				}

				const users = await User.findAll({
					where: { departmentId },
					attributes: { exclude: ["passwordHash"] },
					order: [
						["role", "ASC"],
						["lastName", "ASC"],
						["firstName", "ASC"],
					],
				});

				const department = await Department.findByPk(departmentId, {
					attributes: ["id", "name"],
				});

				const usersWithDepartment = users.map(user => {
					const userData = user.toJSON();
					userData.Department = department ? department.toJSON() : null;
					return userData;
				});

				return res.json({
					success: true,
					message: "Successfully fetched department users.",
					users: usersWithDepartment,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/profile/get", async (req, res) => {
			try {
				const userId = req.user?.userId;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User id is required.",
					});
				}

				const user = await User.findByPk(userId, {
					attributes: {
						exclude: ["passwordHash", "deletedAt"]
					}
				});

				if (!user) {
					return res.status(404).json({
						success: false,
						message: "User not found.",
					});
				}

				let department = null;
				if (user.departmentId) {
					department = await Department.findByPk(user.departmentId, {
						attributes: ["id", "name", "code", "description"]
					});
				}

				return res.json({
					success: true,
					message: "Successfully fetched user profile.",
					profile: {
						...user.toJSON(),
						department
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

		this.router.get("/get-department", async (req, res) => {
			try {
				const departmentId = req.user?.departmentId;
				const userId = req.user?.userId;
				const whereClause = {}

				if (departmentId) {
					whereClause["departmentId"] = departmentId
				}

				if (userId) {
					whereClause["id"] = {
						[Op.not]: userId
					}
				}
				const currentDate = new Date();
				const currentYear = currentDate.getFullYear();
				const currentMonth = currentDate.getMonth() + 1;
				const academicPeriod = currentMonth >= 8
					? `${currentYear}-${currentYear + 1}`
					: `${currentYear - 1}-${currentYear}`;

				const evaluatedFacultyIds = await FacultyEvaluation.findAll({
					where: {
						evaluatorId: userId,
						academicPeriod
					},
					attributes: ['facultyId']
				});

				const evaluatedIds = evaluatedFacultyIds.map(eval2 => eval2.facultyId);

				if (evaluatedIds.length > 0) {
					whereClause["id"] = {
						[Op.and]: [
							{ [Op.not]: userId },
							{ [Op.notIn]: evaluatedIds }
						]
					};
				}

				const users = await User.findAll({
					where: whereClause,
					attributes: { exclude: ["passwordHash"] },
				});

				return res.json({
					success: true,
					users,
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
		this.router.get("/me", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const departmentId = req.user?.departmentId;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User ID are required",
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

				let departmentName = "ALL DEPARTMENT";
				if (departmentId) {
					const department = await Department.findByPk(departmentId);
					if (department) {
						departmentName = department.namel;
					}
				}
				const userData = user.get({ plain: true });

				return res.json({
					success: true,
					user: {
						...userData,
						departmentName: departmentName
					},
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
		this.router.post("/security/request-email-change", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const userRole = req.user?.role;
				const { newEmail, password } = req.body;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User authentication required.",
					});
				}

				if (!newEmail || !password) {
					return res.status(400).json({
						success: false,
						message: "New email and password are required.",
					});
				}

				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(newEmail)) {
					return res.status(400).json({
						success: false,
						message: "Invalid email format.",
					});
				}

				const user = await User.findByPk(userId);
				if (!user) {
					return res.status(404).json({
						success: false,
						message: "User not found.",
					});
				}

				const isMatch = await bcrypt.compare(password, user.passwordHash);
				if (!isMatch) {
					return res.status(400).json({
						success: false,
						message: "Incorrect password.",
					});
				}

				const existingUser = await User.findOne({ where: { email: newEmail } });
				if (existingUser) {
					return res.status(400).json({
						success: false,
						message: "Email address is already in use.",
					});
				}

				const needsVerification = ["USER", "HEAD"].includes(userRole);

				if (needsVerification) {
					const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

					verificationCodes.set(userId, {
						code: verificationCode,
						newEmail: newEmail,
						expiresAt: Date.now() + 10 * 60 * 1000, 
					});

					const subject = "Email Change Verification Code";
					const text = `Your verification code is: ${verificationCode}. This code will expire in 10 minutes.`;
					const html = `
						<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
							<h2 style="color: #1E40AF;">Email Change Verification</h2>
							<p>You have requested to change your email address.</p>
							<div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
								<h1 style="color: #1E40AF; font-size: 32px; letter-spacing: 4px; margin: 0;">${verificationCode}</h1>
							</div>
							<p>This verification code will expire in <strong>10 minutes</strong>.</p>
							<p>If you did not request this change, please ignore this email.</p>
						</div>
					`;
					await sendEmail(newEmail, subject, text, html);
					return res.json({
						success: true,
						message: "Verification code sent to new email address.",
						requiresVerification: true,
					});
				} else {
					user.email = newEmail;
					await user.save();

					return res.json({
						success: true,
						message: "Email changed successfully.",
						requiresVerification: false,
					});
				}
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.post("/security/verify-email-change", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const { verificationCode, newEmail } = req.body;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User authentication required.",
					});
				}

				if (!verificationCode || !newEmail) {
					return res.status(400).json({
						success: false,
						message: "Verification code and new email are required.",
					});
				}

				const storedData = verificationCodes.get(userId);
				if (!storedData) {
					return res.status(400).json({
						success: false,
						message: "No verification request found. Please request a new code.",
					});
				}
				if (Date.now() > storedData.expiresAt) {
					verificationCodes.delete(userId);
					return res.status(400).json({
						success: false,
						message: "Verification code has expired. Please request a new one.",
					});
				}
				if (storedData.code !== verificationCode) {
					return res.status(400).json({
						success: false,
						message: "Invalid verification code.",
					});
				}

				if (storedData.newEmail !== newEmail) {
					return res.status(400).json({
						success: false,
						message: "Email does not match the verification request.",
					});
				}

				const user = await User.findByPk(userId);
				if (!user) {
					return res.status(404).json({
						success: false,
						message: "User not found.",
					});
				}

				user.email = newEmail;
				await user.save();
				verificationCodes.delete(userId);

				return res.json({
					success: true,
					message: "Email changed successfully.",
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.post("/create", upload.single("profilePhoto"), async (req, res) => {
			try {
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
					password,
					role,
					departmentId,
					jobTitle,
					dateHired,
					employmentStatus,
					emergencyContactName,
					emergencyContactNumber,
					emergencyContactRelationship,
				} = req.body;

				if (!firstName || !lastName || !email || !password) {
					return res.status(400).json({
						success: false,
						message: "First name, last name, email, and password are required.",
					});
				}

				const validRoles = ["USER", "MISD", "HEAD"];
				const requestedRole = role || "USER";

				if (!validRoles.includes(requestedRole)) {
					return res.status(400).json({
						success: false,
						message: "Invalid role. Only USER, MISD, and HEAD roles can be created.",
					});
				}

				if (gender && !["MALE", "FEMALE", "OTHER"].includes(gender)) {
					return res.status(400).json({
						success: false,
						message: "Invalid gender value.",
					});
				}

				if (employmentStatus && !["ACTIVE", "INACTIVE", "ON_LEAVE"].includes(employmentStatus)) {
					return res.status(400).json({
						success: false,
						message: "Invalid employment status.",
					});
				}

				const existingUser = await User.findOne({ where: { email } });
				if (existingUser) {
					return res.status(400).json({
						success: false,
						message: "Email address already in use.",
					});
				}

				if (employeeNo) {
					const existingEmployeeNo = await User.findOne({ where: { employeeNo } });
					if (existingEmployeeNo) {
						return res.status(400).json({
							success: false,
							message: "Employee number already in use.",
						});
					}
				}

				const passwordHash = await bcrypt.hash(password, 10);
				const user = await User.create({
					employeeNo: employeeNo || null,
					firstName,
					middleName: middleName || "",
					lastName,
					email,
					contactNumber: contactNumber || "",
					streetAddress: streetAddress || "",
					barangay: barangay || "",
					city: city || "",
					province: province || "",
					postalCode: postalCode || "",
					dateOfBirth: dateOfBirth || null,
					gender: gender || null,
					passwordHash,
					role: requestedRole,
					departmentId: departmentId || null,
					jobTitle: jobTitle || "",
					dateHired: dateHired || null,
					employmentStatus: employmentStatus || "ACTIVE",
					emergencyContactName: emergencyContactName || "",
					emergencyContactNumber: emergencyContactNumber || "",
					emergencyContactRelationship: emergencyContactRelationship || "",
					profilePhoto: req.file ? req.file.path : "",
					isActive: true,
				});

				const userResponse = user.toJSON();
				delete userResponse.passwordHash;

				return res.status(201).json({
					success: true,
					message: "User account created successfully.",
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
		this.router.put("/security/change-password", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const { currentPassword, newPassword } = req.body;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User authentication required.",
					});
				}

				if (!currentPassword || !newPassword) {
					return res.status(400).json({
						success: false,
						message: "Current password and new password are required.",
					});
				}

				if (newPassword.length < 8) {
					return res.status(400).json({
						success: false,
						message: "Password must be at least 8 characters long.",
					});
				}

				const user = await User.findByPk(userId);
				if (!user) {
					return res.status(404).json({
						success: false,
						message: "User not found.",
					});
				}

				const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
				if (!isMatch) {
					return res.status(400).json({
						success: false,
						message: "Current password is incorrect.",
					});
				}

				const newPasswordHash = await bcrypt.hash(newPassword, 10);
				user.passwordHash = newPasswordHash;
				await user.save();

				return res.json({
					success: true,
					message: "Password changed successfully.",
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.put("/admin/update/:id", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const userRole = req.user?.role;
				const { id } = req.params;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User authentication required.",
					});
				}

				if (userRole !== "MISD") {
					return res.status(403).json({
						success: false,
						message: "Unauthorized. Only MISD can edit users.",
					});
				}

				const user = await User.findByPk(id);
				if (!user) {
					return res.status(404).json({
						success: false,
						message: "User not found.",
					});
				}

				const {
					firstName,
					middleName,
					lastName,
					email,
					contactNumber,
					role,
					departmentId,
					jobTitle,
					employmentStatus,
				} = req.body;

				if (role && !["USER", "MISD", "HEAD"].includes(role)) {
					return res.status(400).json({
						success: false,
						message: "Invalid role. Only USER, MISD, and HEAD roles can be assigned.",
					});
				}

				if (email && email !== user.email) {
					const existingUser = await User.findOne({ where: { email } });
					if (existingUser) {
						return res.status(400).json({
							success: false,
							message: "Email address already in use.",
						});
					}
				}

				if (firstName) user.firstName = firstName;
				if (middleName !== undefined) user.middleName = middleName;
				if (lastName) user.lastName = lastName;
				if (email) user.email = email;
				if (contactNumber !== undefined) user.contactNumber = contactNumber;
				if (role) user.role = role;
				if (departmentId !== undefined) user.departmentId = departmentId;
				if (jobTitle !== undefined) user.jobTitle = jobTitle;
				if (employmentStatus) user.employmentStatus = employmentStatus;

				await user.save();

				const userResponse = user.toJSON();
				delete userResponse.passwordHash;

				return res.json({
					success: true,
					message: "User updated successfully.",
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
		this.router.delete("/admin/delete/:id", async (req, res) => {
			try {
				const userId = req.user?.userId;
				const userRole = req.user?.role;
				const { id } = req.params;

				if (!userId) {
					return res.status(400).json({
						success: false,
						message: "User authentication required.",
					});
				}

				if (userRole !== "MISD") {
					return res.status(403).json({
						success: false,
						message: "Unauthorized. Only MISD can delete users.",
					});
				}

				if (parseInt(id) === userId) {
					return res.status(400).json({
						success: false,
						message: "You cannot delete your own account.",
					});
				}

				const user = await User.findByPk(id);
				if (!user) {
					return res.status(404).json({
						success: false,
						message: "User not found.",
					});
				}

				if (["DEAN", "PRESIDENT"].includes(user.role)) {
					return res.status(400).json({
						success: false,
						message: "Cannot delete DEAN or PRESIDENT users.",
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
