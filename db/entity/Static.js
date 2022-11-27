var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Static",
  tableName: "static_data",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    course: {
      type: "int",
      nullable: false,
    },
  },
});
