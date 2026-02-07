// Author: JDM
// Created on: 2026-01-23T13:04:10.915Z
const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const path = require("path");
const { sequelize, StudentEvaluation, User } = require("../models/Models.js");
const bodyParser = require("body-parser");
const { authenticateToken } = require("../middlewares/UserAuthMiddleware");

const app = express();
const router = express.Router();

// -------------------------------------------------------------------------------
// CORS CONFIGURATION
// -------------------------------------------------------------------------------
const DEVELOPMENT = false;
if (DEVELOPMENT) {
	app.use(
		cors({
			origin: "",
			credentials: true,
			optionSuccessStatus: 200,
		})
	);
} else {
	app.use(cors());
}

// -------------------------------------------------------------------------------
// ALL ROUTES
// -------------------------------------------------------------------------------
router.get("/test", async (req, res) => {
	res.status(200).json("This is a test endpoint.");
});
router.get("/reset", async (req, res) => {
	await sequelize.sync({ force: true });
	res.send("Database reset successful.");
});

router.use("/auth", require("../routes/AuthRouter"));
router.use("/user", authenticateToken, require("../routes/UserRouter"));
router.use("/dashboard", authenticateToken, require("../routes/DashboardRouter"));
router.use("/flag-ceremony-attendance", authenticateToken, require("../routes/FlagCeremonyAttendanceRouter"));
router.use("/suggestion-problem", authenticateToken, require("../routes/SuggestionAndProblemRouter"));

router.use("/request-letter", authenticateToken, require("../routes/RequestLetterRouter"));
router.use("/department", authenticateToken, require("../routes/DepartmentRouter"));
router.use("/signature", authenticateToken, require("../routes/SignatureRouter"));
router.use("/notification", authenticateToken, require("../routes/NotificationRouter"));
router.use("/announcement", authenticateToken, require("../routes/AnnouncementRouter"));
router.use("/pass-slip", authenticateToken, require("../routes/PassSlipRouter"));
router.use("/clearance", authenticateToken, require("../routes/ClearanceRouter"));
router.use("/travel-order", authenticateToken, require("../routes/TravelOrderRouter"));

router.use("/accomplishment", authenticateToken, require("../routes/AccomplishmentRouter"));
router.use("/personal-information", authenticateToken, require("../routes/PersonalInformationRouter"));
router.use("/family-background", authenticateToken, require("../routes/FamilyBackgroundRouter"));
router.use("/educational-background", authenticateToken, require("../routes/EducationalBackgroundRouter"));
router.use("/civil-service-eligibility", authenticateToken, require("../routes/CivilServiceEligibilityRouter"));
router.use("/work-experience", authenticateToken, require("../routes/WorkExperienceRouter"));
router.use("/voluntary-work", authenticateToken, require("../routes/VoluntaryWorkRouter"));
router.use("/learning-development", authenticateToken, require("../routes/LearningAndDevelopmentRouter"));
router.use("/skills-hobbies", authenticateToken, require("../routes/SkillsAndHobbiesRouter"));
router.use("/other-information", authenticateToken, require("../routes/OtherInformationRouter"));
router.use("/reference", authenticateToken, require("../routes/ReferenceRouter"));
router.use("/personal-data-sheet", authenticateToken, require("../routes/PersonalDataSheetRouter"));

router.use("/faculty-evaluation", authenticateToken, require("../routes/FacultyEvaluationRouter"));
router.use("/student-evaluation", authenticateToken, require("../routes/StudentEvaluationRouter"));

// AI Assistant Router
router.use("/ai", authenticateToken, require("../routes/AIRouter"));

router.get("/get-faculty-info/:uniqueCode", async (req, res) => {
	try {
		const { uniqueCode } = req.params;

		const evaluation = await StudentEvaluation.findOne({
			where: { uniqueCode }
		});

		if (!evaluation) {
			return res.status(404).json({
				success: false,
				message: "Invalid evaluation code.",
			});
		}
		const faculty = await User.findByPk(evaluation.facultyId, {
			attributes: ["id", "firstName", "lastName"]
		});
		if (!faculty) {
			return res.status(404).json({
				success: false,
				message: "Faculty not found.",
			});
		}
		return res.json({
			success: true,
			faculty: {
				firstName: faculty.firstName,
				lastName: faculty.lastName,
				academicPeriod: evaluation.academicPeriod
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
router.post("/submit", async (req, res) => {
	try {
		const { uniqueCode, studentId, rating, courseCode, message } = req.body;

		if (!uniqueCode || !studentId || !rating || !message) {
			return res.status(400).json({
				success: false,
				message: "Missing required fields.",
			});
		}

		const studentIdRegex = /^\d{4}-\d{5}$/;
		if (!studentIdRegex.test(studentId)) {
			return res.status(400).json({
				success: false,
				message: "Invalid Student ID format. Use: YYYY-XXXXX (e.g., 2022-10934)",
			});
		}

		if (rating < 1 || rating > 5) {
			return res.status(400).json({
				success: false,
				message: "Rating must be between 1 and 5.",
			});
		}

		const existingEval = await StudentEvaluation.findOne({
			where: { uniqueCode }
		});

		if (!existingEval) {
			return res.status(404).json({
				success: false,
				message: "Invalid evaluation code.",
			});
		}

		const facultyId = existingEval.facultyId;
		const academicPeriod = existingEval.academicPeriod;
		const duplicate = await StudentEvaluation.findOne({
			where: {
				studentId,
				uniqueCode,
				academicPeriod,
				status: "ACTIVE"
			}
		});

		if (duplicate) {
			return res.status(409).json({
				success: false,
				message: "You have already submitted an evaluation for this academic period.",
			});
		}

		const ipAddress = req.ip || req.connection.remoteAddress;
		await StudentEvaluation.create({
			facultyId,
			studentId,
			message,
			rating,
			courseCode: courseCode || null,
			uniqueCode,
			academicPeriod,
			ipAddress,
			status: "ACTIVE"
		});

		return res.status(201).json({
			success: true,
			message: "Thank you for your feedback!",
		});
	} catch (err) {
		console.error(err);

		if (err.name === "SequelizeUniqueConstraintError") {
			return res.status(409).json({
				success: false,
				message: "You have already submitted an evaluation.",
			});
		}

		return res.status(500).json({
			success: false,
			message: "Internal server error.",
		});
	}
});

// -------------------------------------------------------------------------------
// APP MIDDLEWARE
// -------------------------------------------------------------------------------
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")));

// Set base path for serverless functions
app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);