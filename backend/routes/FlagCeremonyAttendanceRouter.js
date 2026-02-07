// Author: JDM
// Created on: 2026-02-06T15:56:47.760Z

const express = require("express");
const { FlagCeremonyAttendance } = require("../models/Models");
const upload = require("../middlewares/UploadImageMiddleware"); // Import the upload middleware

class FlagCeremonyAttendanceRouter {
    constructor() {
        this.router = express.Router();
        this.getRouter();
        this.postRouter();
        this.putRouter();
    }

    getRouter() {
        this.router.get("/get-all", async (req, res) => {
            try {
                const userId = req.user?.userId;

                if (!userId) {
                    return res.status(400).json({
                        success: false,
                        message: "User authentication required.",
                    });
                }

                // Fetch only the current user's attendance records
                const flagceremonyattendances = await FlagCeremonyAttendance.findAll({
                    where: { userId },
                    order: [["ceremonyDate", "DESC"]],
                });

                return res.json({
                    success: true,
                    message: "Successfully fetched all attendance records.",
                    flagceremonyattendances,
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
                const userId = req.user?.userId;
                const { id } = req.params;

                if (!userId) {
                    return res.status(400).json({
                        success: false,
                        message: "User authentication required.",
                    });
                }

                const attendance = await FlagCeremonyAttendance.findOne({
                    where: { id, userId },
                });

                if (!attendance) {
                    return res.status(404).json({
                        success: false,
                        message: "Attendance record not found.",
                    });
                }

                return res.json({
                    success: true,
                    message: "Successfully fetched attendance record.",
                    attendance,
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
        this.router.post("/record", upload.single("uploadedProof"), async (req, res) => {
            try {
                const userId = req.user?.userId;

                const {
                    ceremonyDate,
                    ceremonyType,
                    checkInTime,
                    status,
                    isExcused,
                    excuseReason,
                    remarks,
                } = req.body;

                if (!userId) {
                    return res.status(400).json({
                        success: false,
                        message: "User authentication required.",
                    });
                }

                if (!ceremonyDate || !ceremonyType || !status) {
                    return res.status(400).json({
                        success: false,
                        message: "Ceremony date, type, and status are required.",
                    });
                }

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const ceremonyDateObj = new Date(ceremonyDate);
                ceremonyDateObj.setHours(0, 0, 0, 0);

                if (ceremonyDateObj > today) {
                    return res.status(400).json({
                        success: false,
                        message: "Cannot record attendance for future dates.",
                    });
                }

                const existingAttendance = await FlagCeremonyAttendance.findOne({
                    where: {
                        userId,
                        ceremonyDate,
                    },
                });

                if (existingAttendance) {
                    return res.status(400).json({
                        success: false,
                        message: "Attendance already recorded for this date.",
                    });
                }

                if (isExcused && !excuseReason) {
                    return res.status(400).json({
                        success: false,
                        message: "Excuse reason is required when marking as excused.",
                    });
                }

                const attendance = await FlagCeremonyAttendance.create({
                    userId,
                    ceremonyDate,
                    ceremonyType,
                    checkInTime: checkInTime || null,
                    status,
                    isExcused: isExcused === "true" || isExcused === true,
                    excuseReason: excuseReason || "",
                    remarks: remarks || "",
                    uploadedProof: req.file ? req.file.path : "",
                    recordedBy: userId,
                });

                return res.status(201).json({
                    success: true,
                    message: "Attendance recorded successfully.",
                    attendance,
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
        this.router.put("/update/:id", upload.single("uploadedProof"), async (req, res) => {
            try {
                const userId = req.user?.userId;
                const { id } = req.params;

                const {
                    ceremonyDate,
                    ceremonyType,
                    checkInTime,
                    status,
                    isExcused,
                    excuseReason,
                    remarks,
                } = req.body;

                if (!userId) {
                    return res.status(400).json({
                        success: false,
                        message: "User authentication required.",
                    });
                }

                // Find the attendance record
                const attendance = await FlagCeremonyAttendance.findOne({
                    where: { id, userId },
                });

                if (!attendance) {
                    return res.status(404).json({
                        success: false,
                        message: "Attendance record not found or unauthorized.",
                    });
                }

                // Validate required fields if provided
                if (!ceremonyDate || !ceremonyType || !status) {
                    return res.status(400).json({
                        success: false,
                        message: "Ceremony date, type, and status are required.",
                    });
                }

                // Validate date is not in the future
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const ceremonyDateObj = new Date(ceremonyDate);
                ceremonyDateObj.setHours(0, 0, 0, 0);

                if (ceremonyDateObj > today) {
                    return res.status(400).json({
                        success: false,
                        message: "Cannot record attendance for future dates.",
                    });
                }

                // Check if changing date would create duplicate
                if (ceremonyDate !== attendance.ceremonyDate) {
                    const existingAttendance = await FlagCeremonyAttendance.findOne({
                        where: {
                            userId,
                            ceremonyDate,
                            id: { [require("sequelize").Op.ne]: id },
                        },
                    });

                    if (existingAttendance) {
                        return res.status(400).json({
                            success: false,
                            message: "Attendance already recorded for this date.",
                        });
                    }
                }

                // Validate excuse reason if isExcused is true
                if ((isExcused === "true" || isExcused === true) && !excuseReason) {
                    return res.status(400).json({
                        success: false,
                        message: "Excuse reason is required when marking as excused.",
                    });
                }

                // Update the attendance record
                await attendance.update({
                    ceremonyDate,
                    ceremonyType,
                    checkInTime: checkInTime || null,
                    status,
                    isExcused: isExcused === "true" || isExcused === true,
                    excuseReason: excuseReason || "",
                    remarks: remarks || "",
                    uploadedProof: req.file ? req.file.path : attendance.uploadedProof,
                });

                return res.json({
                    success: true,
                    message: "Attendance updated successfully.",
                    attendance,
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
                const userId = req.user?.userId;
                const { id } = req.params;

                if (!userId) {
                    return res.status(400).json({
                        success: false,
                        message: "User authentication required.",
                    });
                }

                const attendance = await FlagCeremonyAttendance.findOne({
                    where: { id, userId },
                });

                if (!attendance) {
                    return res.status(404).json({
                        success: false,
                        message: "Attendance record not found or unauthorized.",
                    });
                }

                await attendance.destroy();

                return res.json({
                    success: true,
                    message: "Attendance deleted successfully.",
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

module.exports = new FlagCeremonyAttendanceRouter().router;