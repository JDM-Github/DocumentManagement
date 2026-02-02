
// Author: JDM
// Created on: 2026-01-23T13:04:10.933Z

require("dotenv").config();
const { sequelize } = require("./models/Models.js");

async function migrateAll() {
    try {
        console.log("🚀 Connecting to database...");
        await sequelize.authenticate();
        console.log("✅ Connection established successfully.");

        console.log("🔄 Running migrations...");
        await sequelize.sync({ force: true });
        console.log("✅ All models migrated successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        await sequelize.close();
    }
}

migrateAll();

