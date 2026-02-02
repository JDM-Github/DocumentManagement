// Author: JDM
// Created on: 2026-01-31T12:26:51.029Z

const express = require("express");
const { Signature, User } = require("../models/Models");

class SignatureRouter {
    constructor() {
        this.router = express.Router();
        this.getRouter();
        this.postRouter();
    }

    getRouter() {
        this.router.get("/get-all", async (req, res) => {
			try {
				const signatures = await Signature.findAll();
				return res.json({
					success: true,
					message: "Successfully fetched all signatures.",
					signatures,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		// GET ALL SIGNATURES FOR A REQUEST WITH USER INFORMATION
		this.router.get("/signatures/:requestId", async (req, res) => {
			try {
				const { requestId } = req.params;

				const signatures = await Signature.findAll({
					where: { requestLetterId: requestId },
					order: [['signedAt', 'ASC']]
				});

				const signaturesWithUserInfo = await Promise.all(
					signatures.map(async (signature) => {
						const user = await User.findByPk(signature.userId);

						return {
							id: signature.id,
							requestLetterId: signature.requestLetterId,
							userId: signature.userId,
							signedAt: signature.signedAt,
							createdAt: signature.createdAt,
							updatedAt: signature.updatedAt,
							userInfo: user ? {
								id: user.id,
								name: user.firstName + " " + user.lastName,
								email: user.email,
							} : null
						};
					})
				);
				return res.json({
					success: true,
					signatures: signaturesWithUserInfo
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error."
				});
			}
		});

		// GET SIGNATURE COUNT FOR A REQUEST
		this.router.get("/signatures/:requestId/count", async (req, res) => {
			try {
				const { requestId } = req.params;

				const count = await Signature.count({
					where: { requestLetterId: requestId }
				});

				return res.json({
					success: true,
					count: count
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error."
				});
			}
		});

		// CHECK IF USER SIGNED A REQUEST
		this.router.get("/signatures/:requestId/user/:userId", async (req, res) => {
			try {
				const { requestId, userId } = req.params;

				const signature = await Signature.findOne({
					where: {
						requestLetterId: requestId,
						userId: userId
					}
				});

				return res.json({
					success: true,
					hasSigned: !!signature,
					signature: signature
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error."
				});
			}
		});
    }

    postRouter() {}
}

module.exports = new SignatureRouter().router;
