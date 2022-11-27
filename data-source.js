const process = require("node:process");
require("dotenv").config();
const { SnakeNamingStrategy } = require("typeorm-naming-strategies");

const User = require("./db/entity/User");
const Admin = require("./db/entity/Admin");
const Order = require("./db/entity/Order");
const GetMoneyAppointment = require("./db/entity/GetMoneyAppointment");
const WAppointment = require("./db/entity/WAppointment");
const Static = require("./db/entity/Static");

const { DataSource } = require("typeorm");

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env;

const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  entities: [User, Admin, Order, GetMoneyAppointment, WAppointment, Static],
  synchronize: true,
  migrationsTableName: "custom_migration_table",
  migrations: ["./src/db/migrations/*.js"],
  cli: {
    migrationsDir: "./src/db/migrations",
  },
  migrationsDir: "./src/db/migrations",
  logging: true,
  namingStrategy: new SnakeNamingStrategy(),
});

module.exports.AppDataSource = AppDataSource;
