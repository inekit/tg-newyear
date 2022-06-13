var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
    name: "City", 
    tableName: "cities",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: true

        },
        name: {
            type: "varchar",
            length: 200,
            unique: true
        }
    },
});