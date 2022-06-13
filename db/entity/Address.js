var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
    name: "Address", 
    tableName: "addresses",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated:true
        },
        name: {
            type: "varchar",
            length: 45,
        },
        street: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        house: {
            type: "int",
            nullable: false
        },
        building: {
            type: "varchar",
            length: 5,
            nullable:true
        },
        latitude: {
            type: "varchar",
            length: 200,
            nullable: false
        },
        longitude: {
            type: "varchar",
            length: 200,
            nullable: false
        },
        cityId: {
            type: "int",
            nullable: false,
        }
    },
    relations: {
        city: {
            target: "City",
            type: "many-to-one",
            cascade: true,
            joinColumn: true,
            onDelete: 'cascade',
            onUpdate: 'cascade',
        },
    }
});