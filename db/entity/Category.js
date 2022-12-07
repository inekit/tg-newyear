var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Category",
  tableName: "categories",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    name: {
      type: "varchar",
      length: 200,
      unique: true,
    },
    description: {
      type: "varchar",
      length: 1000,
      nullable: true,
    },
    link: {
      type: "varchar",
      length: 600,
      nullable: true,
    },
    instruction: {
      type: "varchar",
      length: 2000,
      nullable: true,
    },
    photo: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
  },
});
