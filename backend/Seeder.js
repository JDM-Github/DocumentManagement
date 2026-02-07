// Author: JDM
// Seed Script for Document Tracking System
// Run: node scripts/seed.js

const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");

const sequelize = require("./models/Sequelize");
const {
    User,
    Department,
    // RequestLetter,
    // RequestLetterLog,
    // Signature,
    // Notification,
} = require("./models/Models");

// =========================
// CONSTANTS
// =========================
const BASE_PASSWORD = "password123";
const BASE_DOMAIN = "ccc.edu.ph";

async function seed() {
    try {
        console.log("🔄 Syncing database...");
        await sequelize.sync({ force: true });

        // =========================
        // DEPARTMENTS
        // =========================
        console.log("🏢 Creating departments...");
        const departments = await Promise.all(
            [
                "Department of Arts and Sciences",
                "Department of Teacher Education",
                "Department of Business and Accountancy",
                "Department of Computer and Informatics",
            ].map((name) =>
                Department.create({
                    name,
                    code: name.replace(/\s/g, "").toUpperCase(),
                })
            )
        );

        // =========================
        // USERS (STRUCTURED)
        // =========================
        console.log("👤 Creating structured users...");
        const passwordHash = await bcrypt.hash(BASE_PASSWORD, 10);
        const users = [];

        for (let d = 0; d < departments.length; d++) {
            const department = departments[d];
            const depIndex = d + 1;

            // ---- 5 USERS per department
            for (let i = 0; i < 5; i++) {
                const userIndex = i + 1;

                const user = await User.create({
                    employeeNo: `U${depIndex}${userIndex}000`,
                    firstName: `User${userIndex}`,
                    lastName: `Dep${depIndex}`,
                    email: `user${userIndex}_dep${depIndex}@${BASE_DOMAIN}`,
                    passwordHash,
                    role: "USER",
                    departmentId: department.id,
                });

                users.push(user);
            }

            for (let i = 0; i < 2; i++) {
                const headIndex = i + 1;
                const head = await User.create({
                    employeeNo: `H${depIndex}${headIndex}000`,
                    firstName: `Head${headIndex}`,
                    lastName: `Dep${depIndex}`,
                    email: `head${headIndex}_dep${depIndex}@${BASE_DOMAIN}`,
                    passwordHash,
                    role: "HEAD",
                    departmentId: department.id,
                });

                users.push(head);
            }
        }

        // =========================
        // DEAN (GLOBAL)
        // =========================
        const dean = await User.create({
            employeeNo: "DEAN001",
            firstName: "System",
            lastName: "Dean",
            email: `dean@${BASE_DOMAIN}`,
            passwordHash,
            role: "DEAN",
        });

        users.push(dean);

        // =========================
        // PRESIDENT (GLOBAL)
        // =========================
        const president = await User.create({
            employeeNo: "PRES001",
            firstName: "System",
            lastName: "President",
            email: `president@${BASE_DOMAIN}`,
            passwordHash,
            role: "PRESIDENT",
        });

        users.push(president);

        const misd = await User.create({
            employeeNo: "MISD001",
            firstName: "System",
            lastName: "Misd",
            email: `misd@${BASE_DOMAIN}`,
            passwordHash,
            role: "MISD",
        });

        users.push(misd);

        // =====================================================
        // 🚫 REQUEST LETTERS (COMMENTED – ENABLE LATER)
        // =====================================================
        /*
        console.log("📄 Creating request letters...");
        const requests = [];

        for (let i = 0; i < 50; i++) {
            const requester = faker.helpers.arrayElement(users);
            const department = faker.helpers.arrayElement(departments);

            const request = await RequestLetter.create({
                requestNo: `REQ-${Date.now()}-${i}`,
                requesterId: requester.id,
                requesterName: `${requester.firstName} ${requester.lastName}`,
                purpose: faker.lorem.sentence(),
                status: "TO_RECEIVE",
                currentDepartmentId: department.id,
                createdBy: requester.id,
                allSignature: [],
            });

            requests.push({ request, requester, department });
        }
        */

        // =====================================================
        // 🚫 REQUEST LOGS (COMMENTED – ENABLE LATER)
        // =====================================================
        /*
        console.log("🕒 Creating request logs...");
        for (const item of requests) {
            await RequestLetterLog.create({
                requestLetterId: item.request.id,
                action: "CREATED",
                toDepartmentId: item.department.id,
                actedBy: item.requester.id,
            });
        }
        */

        // =====================================================
        // 🚫 SIGNATURES (COMMENTED – ENABLE LATER)
        // =====================================================
        /*
        console.log("✍️ Creating signatures...");
        for (const item of requests) {
            const signer = faker.helpers.arrayElement(users);
            await Signature.create({
                requestLetterId: item.request.id,
                userId: signer.id,
                signedAt: new Date(),
            });
        }
        */

        // =====================================================
        // 🚫 NOTIFICATIONS (COMMENTED – ENABLE LATER)
        // =====================================================
        /*
        console.log("🔔 Creating notifications...");
        for (const user of users) {
            await Notification.create({
                userId: user.id.toString(),
                title: "Sample Notification",
                message: "This is a placeholder notification.",
                type: "info",
                read: false,
            });
        }
        */

        // =========================
        // SUMMARY
        // =========================
        console.log("✅ Seeding completed successfully!");
        console.log("\n📊 Summary:");
        console.log(`   - Departments: ${departments.length}`);
        console.log(`   - Total Users: ${users.length}`);
        console.log("   - Requests: (commented)");
        console.log("   - Notifications: (commented)");
        console.log("\n🔑 Test Credentials:");
        console.log(`   Password (all users): ${BASE_PASSWORD}`);
        console.log(`   Dean: dean@${BASE_DOMAIN}`);
        console.log(`   President: president@${BASE_DOMAIN}`);
        console.log(`   Sample User: user1_dep1@${BASE_DOMAIN}`);

        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seed();
