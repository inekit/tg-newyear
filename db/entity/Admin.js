var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
    name: "Admin", 
    tableName: "admins",
    columns: {
        userId: {
            type: "bigint",
            primary: true,
        },
        canUpdateAdmins: {
            type: "tinyint",
            default: false,
        }
    },
    relations: {
        user: {
            target: "User",
            type: "one-to-one",
            cascade: true,
            joinColumn: true,
            onDelete: 'cascade',
            onUpdate: 'cascade',
        },
    }
});