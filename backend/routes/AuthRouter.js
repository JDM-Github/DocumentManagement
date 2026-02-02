// Author: JDM
// Updated on: 2026-02-02

require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Department } = require("../models/Models");

class AuthRouter {
    constructor() {
        this.router = express.Router();
        this.setupRoutes();
    }

    setupRoutes() {
        this.router.post("/login", async (req, res) => {
            try {
                const { email, password } = req.body;

                if (!email || !password) {
                    return res.status(400).json({
                        success: false,
                        message: "Email and password are required.",
                    });
                }

                const user = await User.findOne({ where: { email } });

                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid email or password.",
                    });
                }

                const isPasswordValid = await bcrypt.compare(
                    password,
                    user.passwordHash
                );

                if (!isPasswordValid) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid email or password.",
                    });
                }

                const department = await Department.findByPk(user.departmentId);

                await user.update({
                    lastLoginAt: new Date(),
                    isActive: true,
                });

                const token = jwt.sign(
                    {
                        userId: user.id,
                        email: user.email,
                        role: user.role,
                        departmentId: user.departmentId,
                        departmentName: department?.name || null,
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: "24h" }
                );

                return res.json({
                    success: true,
                    message: "Login successful.",
                    token,
                    user: {
                        id: user.id,
                        employeeNo: user.employeeNo,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        name: `${user.firstName} ${user.lastName}`,
                        email: user.email,
                        role: user.role,
                        departmentId: user.departmentId,
                        departmentName: department?.name || null,
                        departmentCode: department?.code || null,
                        isHead: user.role === "HEAD",
                        isActive: true,
                        lastLoginAt: user.lastLoginAt,
                    },
                });
            } catch (err) {
                console.error("Login error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Internal server error.",
                });
            }
        });

        this.router.post("/verify", async (req, res) => {
            try {
                const { token } = req.body;

                if (!token) {
                    return res.status(400).json({
                        success: false,
                        message: "Token is required.",
                    });
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                const user = await User.findByPk(decoded.userId, {
                    attributes: { exclude: ["passwordHash"] },
                });

                if (!user || !user.isActive) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid or expired token.",
                    });
                }

                const department = await Department.findByPk(user.departmentId);

                return res.json({
                    success: true,
                    user: {
                        id: user.id,
                        employeeNo: user.employeeNo,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        name: `${user.firstName} ${user.lastName}`,
                        email: user.email,
                        role: user.role,
                        departmentId: user.departmentId,
                        departmentName: department?.name || null,
                        departmentCode: department?.code || null,
                        isHead: user.role === "HEAD",
                        isActive: user.isActive,
                    },
                });
            } catch (err) {
                console.error("Token verification error:", err);
                return res.status(401).json({
                    success: false,
                    message: "Invalid or expired token.",
                });
            }
        });

        this.router.post("/logout", async (req, res) => {
            try {
                const userId = req.user?.userId;

                if (userId) {
                    await User.update(
                        { isActive: false },
                        { where: { id: userId } }
                    );
                }

                return res.json({
                    success: true,
                    message: "Logout successful.",
                });
            } catch (err) {
                console.error("Logout error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Internal server error.",
                });
            }
        });
    }
}

module.exports = new AuthRouter().router;
