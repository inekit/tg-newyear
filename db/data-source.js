var typeorm = require("typeorm");
require('dotenv').config()

let {DataSource, createConnection} = require("typeorm");
const AppDataSource = new DataSource({
    type: "mysql",
    host: "127.0.0.1",
    port: process.env.PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    entities: [
        require("./entity/User"),
        require("./entity/Category"),
        require("./entity/Channel"),
        require("./entity/Admin"),
        require("./entity/Statistics")
    ],
    synchronize: true,
    logging: false,
})


const connection  = AppDataSource.initialize();

module.exports = connection;