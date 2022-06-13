const { PrimaryGeneratedColumn, Generated } = require("typeorm");

var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
    name: "User", 
    tableName: "users", 
    columns: {
        id: {
            primary: true,
            type: "bigint",
        },
        lastCitySearch: {
            type:"varchar",
            length:200,
            nullable: true
        },
        lastCoordinates: {
            type:"varchar",
            length:200,
            nullable: true
        },
        lastUse: {
            type: "date",
            nullable: true
        },
        
    }
});