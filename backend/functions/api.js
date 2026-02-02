
// Author: JDM
// Created on: 2026-01-23T13:04:10.915Z

const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const path = require("path");
const { sequelize } = require("../models/Models.js");
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
router.use("/request-letter", authenticateToken, require("../routes/RequestLetterRouter"));
router.use("/department", authenticateToken, require("../routes/DepartmentRouter"));
router.use("/signature", authenticateToken, require("../routes/SignatureRouter"));
router.use("/notification", authenticateToken, require("../routes/NotificationRouter"));
router.use("/pass-slip", authenticateToken, require("../routes/PassSlipRouter"));
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

// -------------------------------------------------------------------------------
// APP MIDDLEWARE
// -------------------------------------------------------------------------------
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")));

// Set base path for serverless functions
app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
