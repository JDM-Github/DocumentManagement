// Author: JDM
// Seed Script for Document Tracking System
// Run: node scripts/seed.js

const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");

const sequelize = require("./models/Sequelize");
const {
    User,
    Department,
    RequestLetter,
    RequestLetterLog,
    Signature,
    Notification, // Added Notification model
} = require("./models/Models");

const ROLES = ["USER", "ADMIN", "HEAD"];
const STATUSES = [
    "TO_RECEIVE",
    "ONGOING",
    "TO_RELEASE",   // Added new status
    "REVIEWED",
    "COMPLETED",
    "DECLINED",
];

// Notification types
const NOTIFICATION_TYPES = ['info', 'warning', 'success', 'error', 'document', 'request'];

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
                "Records Office",
                "Human Resources",
                "Accounting",
                "Registrar",
                "IT Office",
            ].map((name) =>
                Department.create({
                    name,
                    code: name.replace(/\s/g, "").toUpperCase(),
                })
            )
        );

        // =========================
        // USERS
        // =========================
        console.log("👤 Creating users...");
        const passwordHash = await bcrypt.hash("password123", 10);
        const defaultDepartment = departments[0];

        // Create 6 fixed users (one for each notification type)
        const fixedUsers = [
            {
                employeeNo: "ADMIN001",
                firstName: "System",
                lastName: "Admin",
                email: "admin@company.com",
                role: "ADMIN",
                userId: "admin001", // For notification userId field
            },
            {
                employeeNo: "HEAD001",
                firstName: "Department",
                lastName: "Head",
                email: "head@company.com",
                role: "HEAD",
                userId: "head001",
            },
            {
                employeeNo: "USER001",
                firstName: "Default",
                lastName: "User",
                email: "user@company.com",
                role: "USER",
                userId: "user001",
            },
            {
                employeeNo: "USER002",
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@company.com",
                role: "USER",
                userId: "user002",
            },
            {
                employeeNo: "USER003",
                firstName: "Jane",
                lastName: "Smith",
                email: "jane.smith@company.com",
                role: "USER",
                userId: "user003",
            },
            {
                employeeNo: "USER004",
                firstName: "Robert",
                lastName: "Johnson",
                email: "robert.johnson@company.com",
                role: "USER",
                userId: "user004",
            },
        ];

        const fixedUserRecords = [];
        for (const data of fixedUsers) {
            const user = await User.create({
                ...data,
                passwordHash,
                departmentId: defaultDepartment.id,
            });
            fixedUserRecords.push({ ...data, id: user.id });
        }

        const users = [];

        for (let i = 0; i < 20; i++) {
            const department =
                departments[Math.floor(Math.random() * departments.length)];

            const user = await User.create({
                employeeNo: faker.string.numeric(6),
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: faker.internet.email().toLowerCase(),
                passwordHash,
                role: faker.helpers.arrayElement(ROLES),
                departmentId: department.id,
            });
            users.push(user);
        }

        console.log("📄 Creating request letters...");
        const requests = [];

        for (let i = 0; i < 50; i++) {
            const requester = faker.helpers.arrayElement(users);
            const department =
                departments[Math.floor(Math.random() * departments.length)];
            const status = faker.helpers.arrayElement(STATUSES);

            const request = await RequestLetter.create({
                requestNo: `REQ-${Date.now()}-${i}`,
                requesterId: requester.id,
                requesterName: `${requester.firstName} ${requester.lastName}`,
                purpose: faker.lorem.sentence(),
                status,
                currentDepartmentId: department.id,
                createdBy: requester.id,
                allSignature: [],
            });

            requests.push({ request, requester, department, status });
        }

        // =========================
        // NOTIFICATIONS
        // =========================
        console.log("🔔 Creating notifications for fixed users...");

        // Sample notification data for each type
        const notificationSamples = [
            // INFO type notifications
            {
                title: "System Update",
                message: "The system will undergo maintenance this weekend. Please save your work.",
                type: "info",
                link: "/announcements",
                metadata: { priority: "low", category: "system" }
            },
            {
                title: "Holiday Announcement",
                message: "Office will be closed on December 25 for Christmas Day.",
                type: "info",
                link: "/calendar",
                metadata: { date: "2024-12-25", duration: "1 day" }
            },

            // WARNING type notifications
            {
                title: "Password Expiry Warning",
                message: "Your password will expire in 7 days. Please update it.",
                type: "warning",
                link: "/settings/security",
                metadata: { daysLeft: 7, action: "change_password" }
            },
            {
                title: "Incomplete Profile",
                message: "Your profile is 60% complete. Add missing information.",
                type: "warning",
                link: "/profile/edit",
                metadata: { completion: 60, missingFields: ["phone", "address"] }
            },

            // SUCCESS type notifications
            {
                title: "Document Approved",
                message: "Your document 'Quarterly Report' has been approved.",
                type: "success",
                link: "/documents/123",
                metadata: { documentId: "123", approver: "John Smith" }
            },
            {
                title: "Request Completed",
                message: "Your leave request has been processed successfully.",
                type: "success",
                link: "/requests/456",
                metadata: { requestId: "456", status: "approved" }
            },

            {
                title: "Upload Failed",
                message: "Failed to upload document due to size limit (max 10MB).",
                type: "error",
                link: "/documents/upload",
                metadata: { error: "size_limit", maxSize: "10MB" }
            },
            {
                title: "Request Rejected",
                message: "Your document request was rejected. Please check remarks.",
                type: "error",
                link: "/requests/789",
                metadata: { requestId: "789", reason: "Incomplete information" }
            },

            {
                title: "New Document Assigned",
                message: "A new document requires your review.",
                type: "document",
                link: "/documents/review/101",
                metadata: { documentId: "101", type: "review", deadline: "2024-12-31" }
            },
            {
                title: "Document Requires Signature",
                message: "Please sign the attached contract document.",
                type: "document",
                link: "/documents/sign/202",
                metadata: { documentId: "202", action: "signature", urgency: "high" }
            },

            {
                title: "New Request Received",
                message: "You have a new document request from Accounting Department.",
                type: "request",
                link: "/requests/incoming/303",
                metadata: { requestId: "303", fromDepartment: "Accounting", type: "document_request" }
            },
            {
                title: "Request Status Updated",
                message: "Your request has moved to review stage.",
                type: "request",
                link: "/requests/track/404",
                metadata: { requestId: "404", oldStatus: "pending", newStatus: "review" }
            }
        ];

        for (const user of fixedUserRecords) {
            console.log(`   Creating notifications for ${user.firstName} ${user.lastName}...`);

            for (let i = 0; i < 2; i++) {
                const sample = faker.helpers.arrayElement(notificationSamples);
                const isRead = i === 1; 

                await Notification.create({
                    userId: user.id.toString(),
                    title: sample.title,
                    message: sample.message,
                    type: sample.type,
                    read: isRead,
                    metadata: sample.metadata,
                    link: sample.link,
                    createdAt: faker.date.between({
                        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
                        to: new Date(),
                    }),
                });
            }
        }

        console.log("🔔 Creating random notifications for other users...");
        for (let i = 0; i < 30; i++) {
            const user = faker.helpers.arrayElement(users);
            const sample = faker.helpers.arrayElement(notificationSamples);

            await Notification.create({
                userId: user.id.toString(),
                title: sample.title,
                message: faker.lorem.sentence(),
                type: faker.helpers.arrayElement(NOTIFICATION_TYPES),
                read: faker.datatype.boolea+n(0.3),
                metadata: sample.metadata,
                link: sample.link,
                createdAt: faker.date.recent({ days: 30 }),
            });
        }

        // =========================
        // REQUEST LOGS
        // =========================
        console.log("🕒 Creating request logs...");

        for (const item of requests) {
            const { request, requester, department, status } = item;

            // CREATED
            await RequestLetterLog.create({
                requestLetterId: request.id,
                action: "CREATED",
                toDepartmentId: department.id,
                actedBy: requester.id,
            });

            // RECEIVED
            if (status !== "TO_RECEIVE") {
                await RequestLetterLog.create({
                    requestLetterId: request.id,
                    action: "RECEIVED",
                    toDepartmentId: department.id,
                    actedBy: faker.helpers.arrayElement(users).id,
                });
            }

            // REVIEWED
            if (["TO_RELEASE", "REVIEWED", "COMPLETED"].includes(status)) {
                await RequestLetterLog.create({
                    requestLetterId: request.id,
                    action: "REVIEWED",
                    actedBy: faker.helpers.arrayElement(users).id,
                });
            }

            // COMPLETED
            if (status === "COMPLETED") {
                await RequestLetterLog.create({
                    requestLetterId: request.id,
                    action: "COMPLETED",
                    actedBy: faker.helpers.arrayElement(users).id,
                });
            }

            // DECLINED
            if (status === "DECLINED") {
                await RequestLetterLog.create({
                    requestLetterId: request.id,
                    action: "DECLINED",
                    actedBy: faker.helpers.arrayElement(users).id,
                    remarks: faker.lorem.sentence(),
                });
            }
        }

        // =========================
        // SIGNATURES
        // =========================
        console.log("✍️ Creating signatures...");

        for (const item of requests) {
            const { request, status } = item;

            // Only add signatures for reviewed, to_release, or completed requests
            if (["TO_RELEASE", "REVIEWED", "COMPLETED"].includes(status)) {
                // Random number of signatures (1-5)
                const signatureCount = faker.number.int({ min: 1, max: 5 });
                const signatureUserIds = [];

                for (let i = 0; i < signatureCount; i++) {
                    const signer = faker.helpers.arrayElement(users);

                    // Avoid duplicate signatures from same user
                    if (!signatureUserIds.includes(signer.id)) {
                        signatureUserIds.push(signer.id);

                        // Create signature record
                        await Signature.create({
                            requestLetterId: request.id,
                            userId: signer.id,
                            signedAt: faker.date.between({
                                from: request.createdAt,
                                to: new Date(),
                            }),
                        });
                    }
                }

                // Update request's allSignature array
                await RequestLetter.update(
                    { allSignature: signatureUserIds },
                    { where: { id: request.id } }
                );
            }
        }

        console.log("✅ Seeding completed successfully!");
        console.log("\n📊 Summary:");
        console.log(`   - Departments: ${departments.length}`);
        console.log(`   - Users: ${users.length + fixedUserRecords.length}`);
        console.log(`   - Requests: ${requests.length}`);
        console.log(`   - Notifications: Created for all fixed users + random`);
        console.log(`   - Signatures: Created for reviewed/completed requests`);
        console.log("\n🔑 Test Credentials (6 Fixed Users):");
        console.log("   Admin: admin@company.com / password123");
        console.log("   Head:  head@company.com / password123");
        console.log("   User1: user@company.com / password123");
        console.log("   User2: john.doe@company.com / password123");
        console.log("   User3: jane.smith@company.com / password123");
        console.log("   User4: robert.johnson@company.com / password123");
        console.log("\n🔔 Notifications:");
        console.log("   - Each fixed user has 2 notifications (1 read, 1 unread)");
        console.log("   - 30 additional random notifications created");
        console.log("   - All notification types covered: info, warning, success, error, document, request");

        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seed();