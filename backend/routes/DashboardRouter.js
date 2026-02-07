// Author: JDM
// Created on: 2026-02-06

const express = require("express");
const { User, RequestLetter, AccomplishmentReport, TravelOrder, PassSlip } = require("../models/Models");
const { Op } = require("sequelize");
const Holidays = require('date-holidays');

class DashboardRouter {
	constructor() {
		this.router = express.Router();
		this.getRouter();
	}

	getRouter() {
		this.router.get("/stats", async (req, res) => {
			try {
				const departmentId = req.user?.departmentId;
				const role = req.user?.role;

				const canSeeAll = !departmentId || role === "DEAN" || role === "PRESIDENT" || role === "MISD";

				const departmentWhere = canSeeAll ? {} : { departmentId };
				const requestLetterWhere = canSeeAll ? {} : { currentDepartmentId: departmentId };

				const now = new Date();
				const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

				const [
					totalRequestLetters,
					totalAccomplishmentReports,
					totalTravelOrders,
					totalPassSlips,
					lastMonthRequestLetters,
					lastMonthAccomplishmentReports,
					lastMonthTravelOrders,
					lastMonthPassSlips
				] = await Promise.all([
					RequestLetter.count({
						where: {
							...requestLetterWhere,
							status: { [Op.ne]: "DELETED" }
						}
					}),
					AccomplishmentReport.count({ where: departmentWhere }),
					TravelOrder.count({ where: departmentWhere }),
					PassSlip.count({ where: departmentWhere }),
					RequestLetter.count({
						where: {
							...requestLetterWhere,
							status: { [Op.ne]: "DELETED" },
							createdAt: { [Op.lt]: thisMonth }
						}
					}),
					AccomplishmentReport.count({
						where: {
							...departmentWhere,
							createdAt: { [Op.lt]: thisMonth }
						}
					}),
					TravelOrder.count({
						where: {
							...departmentWhere,
							createdAt: { [Op.lt]: thisMonth }
						}
					}),
					PassSlip.count({
						where: {
							...departmentWhere,
							createdAt: { [Op.lt]: thisMonth }
						}
					})
				]);

				const totalDocuments = totalRequestLetters + totalAccomplishmentReports + totalTravelOrders + totalPassSlips;
				const lastMonthTotal = lastMonthRequestLetters + lastMonthAccomplishmentReports + lastMonthTravelOrders + lastMonthPassSlips;
				const documentsChange = lastMonthTotal > 0
					? (((totalDocuments - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1)
					: totalDocuments > 0 ? 100 : 0;

				const [
					pendingRequestLetters,
					pendingAccomplishmentReports,
					pendingTravelOrders,
					pendingPassSlips,
					lastMonthPendingTotal
				] = await Promise.all([
					RequestLetter.count({
						where: {
							...requestLetterWhere,
							status: { [Op.in]: ["TO_RECEIVE", "ONGOING", "TO_RELEASE", "SENT TO DEAN", "SENT TO PRESIDENT"] }
						}
					}),
					AccomplishmentReport.count({
						where: {
							...departmentWhere,
							status: "PENDING"
						}
					}),
					TravelOrder.count({
						where: {
							...departmentWhere,
							status: { [Op.in]: ["PENDING", "APPROVED BY DEAN"] }
						}
					}),
					PassSlip.count({
						where: {
							...departmentWhere,
							status: { [Op.in]: ["PENDING", "APPROVED BY DEAN"] }
						}
					}),
					Promise.all([
						RequestLetter.count({
							where: {
								...requestLetterWhere,
								status: { [Op.in]: ["TO_RECEIVE", "ONGOING", "TO_RELEASE", "SENT TO DEAN", "SENT TO PRESIDENT"] },
								createdAt: { [Op.lt]: thisMonth }
							}
						}),
						AccomplishmentReport.count({
							where: {
								...departmentWhere,
								status: "PENDING",
								createdAt: { [Op.lt]: thisMonth }
							}
						}),
						TravelOrder.count({
							where: {
								...departmentWhere,
								status: { [Op.in]: ["PENDING", "APPROVED BY DEAN"] },
								createdAt: { [Op.lt]: thisMonth }
							}
						}),
						PassSlip.count({
							where: {
								...departmentWhere,
								status: { [Op.in]: ["PENDING", "APPROVED BY DEAN"] },
								createdAt: { [Op.lt]: thisMonth }
							}
						})
					]).then(counts => counts.reduce((a, b) => a + b, 0))
				]);

				const totalPending = pendingRequestLetters + pendingAccomplishmentReports + pendingTravelOrders + pendingPassSlips;
				const pendingChange = lastMonthPendingTotal > 0
					? (((totalPending - lastMonthPendingTotal) / lastMonthPendingTotal) * 100).toFixed(1)
					: totalPending > 0 ? 100 : 0;

				const [
					completedRequestLetters,
					completedAccomplishmentReports,
					completedTravelOrders,
					completedPassSlips,
					lastMonthCompletedTotal
				] = await Promise.all([
					RequestLetter.count({
						where: {
							...requestLetterWhere,
							status: { [Op.in]: ["COMPLETED", "REVIEWED"] }
						}
					}),
					AccomplishmentReport.count({
						where: {
							...departmentWhere,
							status: { [Op.in]: ["APPROVED BY DEAN", "APPROVED BY PRESIDENT"] }
						}
					}),
					TravelOrder.count({
						where: {
							...departmentWhere,
							status: "APPROVED BY PRESIDENT"
						}
					}),
					PassSlip.count({
						where: {
							...departmentWhere,
							status: { [Op.in]: ["APPROVED BY DEAN", "APPROVED BY PRESIDENT"] }
						}
					}),
					Promise.all([
						RequestLetter.count({
							where: {
								...requestLetterWhere,
								status: { [Op.in]: ["COMPLETED", "REVIEWED"] },
								createdAt: { [Op.lt]: thisMonth }
							}
						}),
						AccomplishmentReport.count({
							where: {
								...departmentWhere,
								status: { [Op.in]: ["APPROVED BY DEAN", "APPROVED BY PRESIDENT"] },
								createdAt: { [Op.lt]: thisMonth }
							}
						}),
						TravelOrder.count({
							where: {
								...departmentWhere,
								status: "APPROVED BY PRESIDENT",
								createdAt: { [Op.lt]: thisMonth }
							}
						}),
						PassSlip.count({
							where: {
								...departmentWhere,
								status: { [Op.in]: ["APPROVED BY DEAN", "APPROVED BY PRESIDENT"] },
								createdAt: { [Op.lt]: thisMonth }
							}
						})
					]).then(counts => counts.reduce((a, b) => a + b, 0))
				]);

				const totalCompleted = completedRequestLetters + completedAccomplishmentReports + completedTravelOrders + completedPassSlips;
				const completedChange = lastMonthCompletedTotal > 0
					? (((totalCompleted - lastMonthCompletedTotal) / lastMonthCompletedTotal) * 100).toFixed(1)
					: totalCompleted > 0 ? 100 : 0;

				// Faculty Members (Active users)
				const userWhere = canSeeAll
					? { isActive: true, employmentStatus: "ACTIVE" }
					: { departmentId, isActive: true, employmentStatus: "ACTIVE" };

				const [totalFaculty, lastMonthFaculty] = await Promise.all([
					User.count({ where: userWhere }),
					User.count({
						where: {
							...userWhere,
							createdAt: { [Op.lt]: thisMonth }
						}
					})
				]);

				const facultyChange = lastMonthFaculty > 0
					? (((totalFaculty - lastMonthFaculty) / lastMonthFaculty) * 100).toFixed(1)
					: totalFaculty > 0 ? 100 : 0;

				return res.json({
					success: true,
					message: "Dashboard statistics fetched successfully.",
					stats: {
						totalDocuments: {
							value: totalDocuments,
							change: `${documentsChange >= 0 ? '+' : ''}${documentsChange}%`,
							trend: documentsChange >= 0 ? 'up' : 'down'
						},
						pendingRequests: {
							value: totalPending,
							change: `${pendingChange >= 0 ? '+' : ''}${pendingChange}%`,
							trend: pendingChange <= 0 ? 'down' : 'up'
						},
						completed: {
							value: totalCompleted,
							change: `${completedChange >= 0 ? '+' : ''}${completedChange}%`,
							trend: completedChange >= 0 ? 'up' : 'down'
						},
						facultyMembers: {
							value: totalFaculty,
							change: `${facultyChange >= 0 ? '+' : ''}${facultyChange}%`,
							trend: facultyChange >= 0 ? 'up' : 'down'
						}
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

		this.router.get("/monthly-data", async (req, res) => {
			try {
				const departmentId = req.user?.departmentId;
				const role = req.user?.role;
				const canSeeAll = !departmentId || role === "DEAN" || role === "PRESIDENT" || role === "MISD";
				const departmentWhere = canSeeAll ? {} : { departmentId };
				const requestLetterWhere = canSeeAll ? {} : { currentDepartmentId: departmentId };

				const now = new Date();
				const monthlyData = [];

				for (let i = 5; i >= 0; i--) {
					const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
					const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

					const monthWhere = {
						...departmentWhere,
						createdAt: {
							[Op.gte]: monthDate,
							[Op.lt]: nextMonth
						}
					};

					const requestLetterMonthWhere = {
						...requestLetterWhere,
						createdAt: {
							[Op.gte]: monthDate,
							[Op.lt]: nextMonth
						}
					};

					const [
						requestLetters,
						accomplishmentReports,
						travelOrders,
						passSlips,
						completedRequests,
						completedAccomplishments,
						completedTravels,
						completedPasses
					] = await Promise.all([
						RequestLetter.count({
							where: {
								...requestLetterMonthWhere,
								status: { [Op.ne]: "DELETED" }
							}
						}),
						AccomplishmentReport.count({ where: monthWhere }),
						TravelOrder.count({ where: monthWhere }),
						PassSlip.count({ where: monthWhere }),
						RequestLetter.count({
							where: {
								...requestLetterMonthWhere,
								status: { [Op.in]: ["COMPLETED", "REVIEWED"] }
							}
						}),
						AccomplishmentReport.count({
							where: {
								...monthWhere,
								status: { [Op.in]: ["APPROVED BY DEAN", "APPROVED BY PRESIDENT"] }
							}
						}),
						TravelOrder.count({
							where: {
								...monthWhere,
								status: "APPROVED BY PRESIDENT"
							}
						}),
						PassSlip.count({
							where: {
								...monthWhere,
								status: { [Op.in]: ["APPROVED BY DEAN", "APPROVED BY PRESIDENT"] }
							}
						})
					]);

					const totalDocs = requestLetters + accomplishmentReports + travelOrders + passSlips;
					const totalCompleted = completedRequests + completedAccomplishments + completedTravels + completedPasses;

					monthlyData.push({
						month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
						documents: totalDocs,
						completed: totalCompleted,
						pending: totalDocs - totalCompleted
					});
				}

				return res.json({
					success: true,
					monthlyData
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/document-types", async (req, res) => {
			try {
				const departmentId = req.user?.departmentId;
				const role = req.user?.role;
				const canSeeAll = !departmentId || role === "DEAN" || role === "PRESIDENT" || role === "MISD";
				const departmentWhere = canSeeAll ? {} : { departmentId };
				const requestLetterWhere = canSeeAll ? {} : { currentDepartmentId: departmentId };

				const [
					requestLetters,
					accomplishmentReports,
					travelOrders,
					passSlips
				] = await Promise.all([
					RequestLetter.count({
						where: {
							...requestLetterWhere,
							status: { [Op.ne]: "DELETED" }
						}
					}),
					AccomplishmentReport.count({ where: departmentWhere }),
					TravelOrder.count({ where: departmentWhere }),
					PassSlip.count({ where: departmentWhere })
				]);

				const documentTypes = [
					{ name: 'Request Letters', value: requestLetters, color: '#3B82F6' },
					{ name: 'Accomplishment Reports', value: accomplishmentReports, color: '#8B5CF6' },
					{ name: 'Travel Orders', value: travelOrders, color: '#10B981' },
					{ name: 'Pass Slips', value: passSlips, color: '#F59E0B' },
				];

				return res.json({
					success: true,
					documentTypes: documentTypes.filter(d => d.value > 0)
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/holidays/:year", async (req, res) => {
			try {
				const { year } = req.params;
				const hd = new Holidays('PH');
				const holidays = hd.getHolidays(parseInt(year));

				const formattedHolidays = holidays.map(h => ({
					date: h.date,
					name: h.name,
					type: h.type
				}));

				return res.json({
					success: true,
					holidays: formattedHolidays
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/accomplishment-rate", async (req, res) => {
			try {
				const departmentId = req.user?.departmentId;
				const role = req.user?.role;
				const canSeeAll = !departmentId || role === "DEAN" || role === "PRESIDENT" || role === "MISD";
				const departmentWhere = canSeeAll ? {} : { departmentId };
				const requestLetterWhere = canSeeAll ? {} : { currentDepartmentId: departmentId };

				const now = new Date();
				const accomplishments = [];

				for (let i = 5; i >= 0; i--) {
					const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
					const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

					const monthWhere = {
						...departmentWhere,
						createdAt: {
							[Op.gte]: monthDate,
							[Op.lt]: nextMonth
						}
					};

					const requestLetterMonthWhere = {
						...requestLetterWhere,
						createdAt: {
							[Op.gte]: monthDate,
							[Op.lt]: nextMonth
						}
					};

					const [total, completed] = await Promise.all([
						Promise.all([
							RequestLetter.count({
								where: {
									...requestLetterMonthWhere,
									status: { [Op.ne]: "DELETED" }
								}
							}),
							AccomplishmentReport.count({ where: monthWhere }),
							TravelOrder.count({ where: monthWhere }),
							PassSlip.count({ where: monthWhere })
						]).then(counts => counts.reduce((a, b) => a + b, 0)),
						Promise.all([
							RequestLetter.count({
								where: {
									...requestLetterMonthWhere,
									status: { [Op.in]: ["COMPLETED", "REVIEWED"] }
								}
							}),
							AccomplishmentReport.count({
								where: {
									...monthWhere,
									status: { [Op.in]: ["APPROVED BY DEAN", "APPROVED BY PRESIDENT"] }
								}
							}),
							TravelOrder.count({
								where: {
									...monthWhere,
									status: "APPROVED BY PRESIDENT"
								}
							}),
							PassSlip.count({
								where: {
									...monthWhere,
									status: { [Op.in]: ["APPROVED BY DEAN", "APPROVED BY PRESIDENT"] }
								}
							})
						]).then(counts => counts.reduce((a, b) => a + b, 0))
					]);

					const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

					accomplishments.push({
						month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
						rate
					});
				}

				const avgRate = accomplishments.reduce((sum, item) => sum + item.rate, 0) / accomplishments.length;

				return res.json({
					success: true,
					accomplishments,
					averageRate: avgRate.toFixed(1)
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

module.exports = new DashboardRouter().router;