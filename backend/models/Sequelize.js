
// Author: [object Object]
// Created on: 2026-01-23T13:04:10.928Z

require("dotenv").config();
const pg = require("pg");
const { Sequelize } = require("sequelize");

const url = process.env.DATABASE_URL;
const sequelize = new Sequelize(url, {
	dialect: "postgres",
	dialectModule: pg,
	dialectOptions: {
		ssl: {
			require: true,
			rejectUnauthorized: false,
		},
	},
});

module.exports = sequelize;
