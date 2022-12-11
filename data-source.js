const process = require("node:process");
require("dotenv").config();
const { SnakeNamingStrategy } = require("typeorm-naming-strategies");

const User = require("./src/db/entity/User");
const Admin = require("./src/db/entity/Admin");
const Category = require("./src/db/entity/Category");
const Item = require("./src/db/entity/Item");
const WAppointment = require("./src/db/entity/WAppointment");
const Static = require("./src/db/entity/Static");
const Question = require("./src/db/entity/Question");
const Answer = require("./src/db/entity/Answer");
const Report = require("./src/db/entity/Report");

const { DataSource } = require("typeorm");

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env;

const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  entities: [
    User,
    Admin,
    Category,
    Item,
    WAppointment,
    Static,
    Question,
    Answer,
    Report,
  ],
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
